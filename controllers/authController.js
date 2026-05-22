import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import transporter from "../config/mailConfig.js";
import db from "../config/dbConfig.js";
import authConfig from "../config/authConfig.js";
import dbQueries from "../queries/dbQueries.js";

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: authConfig.accessTokenExpiresIn,
  });
};

const cookieOptions = (maxAge) => ({
  ...authConfig.cookieOptions,
  maxAge,
});

const invalidCredentials = (res) =>
  res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });

const clearAuthCookies = (res) => {
  res.clearCookie(authConfig.cookieNames.accessToken);
  res.clearCookie(authConfig.cookieNames.refreshToken);
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await db.query(dbQueries.getUserByUsername, [username]);

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Registration failed",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await db.query(dbQueries.createUser, [
      username,
      email,
      hash,
    ]);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: result.rows[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await db.query(dbQueries.getUserByUsername, [username]);

    if (result.rows.length === 0) {
      return invalidCredentials(res);
    }

    const user = result.rows[0];

    if (user.LockedUntil && new Date(user.LockedUntil) > new Date()) {
      return res.status(403).json({
        success: false,
        message: "Account temporarily locked",
      });
    }

    const match = await bcrypt.compare(password, user.PasswordHash);

    if (!match) {
      const failed = (user.FailedAttempts || 0) + 1;

      await db.query(dbQueries.incrementFailedAttempts, [user.Id]);

      if (failed >= authConfig.maxFailedLoginAttempts) {
        const lockUntil = new Date(Date.now() + authConfig.accountLockMs);

        await db.query(dbQueries.lockUser, [lockUntil, user.Id]);

        return res.status(403).json({
          success: false,
          message: "Account temporarily locked",
        });
      }

      return invalidCredentials(res);
    }

    await db.query(dbQueries.resetLoginAttempts, [user.Id]);

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + authConfig.mfaCodeMaxAgeMs);

    await db.query(dbQueries.createMfaCode, [user.Id, otpHash, otpExpiry]);

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: user.Email,
      subject: "Login OTP",
      text: `OTP: ${otp}\nExpires soon`,
    });

    return res.json({
      success: true,
      message: "OTP sent",
      userId: user.Id,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const verifyMfa = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const result = await db.query(dbQueries.getValidMfa, [userId]);

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP missing",
      });
    }

    const record = result.rows[0];
    const validOtp = await bcrypt.compare(otp, record.Code);

    if (!validOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await db.query(dbQueries.markMfaUsed, [record.Id]);

    const user = await db.query(dbQueries.getUserById, [userId]);

    const payload = {
      id: user.rows[0].Id,
      username: user.rows[0].Username,
    };

    const accessToken = generateAccessToken(payload);
    const refreshRaw = crypto.randomBytes(64).toString("hex");
    const refreshHash = await bcrypt.hash(refreshRaw, 10);
    const expiry = new Date(Date.now() + authConfig.refreshTokenMaxAgeMs);

    await db.query(dbQueries.createRefreshToken, [
      userId,
      refreshHash,
      expiry,
    ]);

    res.cookie(
      authConfig.cookieNames.accessToken,
      accessToken,
      cookieOptions(authConfig.accessTokenMaxAgeMs)
    );

    res.cookie(
      authConfig.cookieNames.refreshToken,
      refreshRaw,
      cookieOptions(authConfig.refreshTokenMaxAgeMs)
    );

    return res.json({
      success: true,
      message: "Login success",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const refreshUser = async (req, res) => {
  try {
    const token = req.cookies[authConfig.cookieNames.refreshToken];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const tokens = await db.query(dbQueries.getRefreshTokensForVerification);
    let matched = null;

    for (const item of tokens.rows) {
      const valid = await bcrypt.compare(token, item.TokenHash);

      if (valid) {
        matched = item;
        break;
      }
    }

    if (!matched) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (matched.Revoked) {
      await db.query(dbQueries.revokeAllUserTokens, [matched.UserId]);
      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    await db.query(dbQueries.revokeRefreshToken, [matched.Id]);

    const newRaw = crypto.randomBytes(64).toString("hex");
    const newHash = await bcrypt.hash(newRaw, 10);
    const expiry = new Date(Date.now() + authConfig.refreshTokenMaxAgeMs);

    await db.query(dbQueries.createRefreshToken, [
      matched.UserId,
      newHash,
      expiry,
    ]);

    const user = await db.query(dbQueries.getUserById, [matched.UserId]);

    const accessToken = generateAccessToken({
      id: user.rows[0].Id,
      username: user.rows[0].Username,
    });

    res.cookie(
      authConfig.cookieNames.accessToken,
      accessToken,
      cookieOptions(authConfig.accessTokenMaxAgeMs)
    );

    res.cookie(
      authConfig.cookieNames.refreshToken,
      newRaw,
      cookieOptions(authConfig.refreshTokenMaxAgeMs)
    );

    return res.json({
      success: true,
      message: "Token rotated",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { userId } = req.body;

    await db.query(dbQueries.revokeAllUserTokens, [userId]);
    clearAuthCookies(res);

    return res.json({
      success: true,
      message: "Logout success",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await db.query(dbQueries.getUserByEmail, [email]);

    if (user.rows.length === 0) {
      return res.json({
        success: true,
        message: "If this account exists, a reset email has been sent",
      });
    }

    const current = user.rows[0];
    const raw = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(raw, 10);
    const expiry = new Date(Date.now() + authConfig.passwordResetMaxAgeMs);

    await db.query(dbQueries.createPasswordResetToken, [
      current.Id,
      hash,
      expiry,
    ]);

    const resetLink = `${authConfig.frontendResetUrl}?token=${raw}&userId=${current.Id}`;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: current.Email,
      subject: "Password Reset",
      text: `Reset link:\n\n${resetLink}\n\nExpires soon`,
    });

    return res.json({
      success: true,
      message: "If this account exists, a reset email has been sent",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;

    const reset = await db.query(dbQueries.getPasswordResetToken, [userId]);

    if (reset.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid link",
      });
    }

    const record = reset.rows[0];
    const valid = await bcrypt.compare(token, record.TokenHash);

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await db.query(dbQueries.updatePassword, [hash, userId]);
    await db.query(dbQueries.markPasswordResetUsed, [record.Id]);
    await db.query(dbQueries.revokeAllUserTokens, [userId]);

    return res.json({
      success: true,
      message: "Password changed",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
