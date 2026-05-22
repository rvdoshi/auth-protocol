const isProduction = process.env.NODE_ENV === "production";

const minutes = (value) => value * 60 * 1000;
const days = (value) => value * 24 * 60 * 60 * 1000;

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const authConfig = {
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  accessTokenMaxAgeMs: minutes(
    toNumber(process.env.JWT_ACCESS_MAX_AGE_MINUTES, 15)
  ),
  refreshTokenMaxAgeMs: days(
    toNumber(process.env.JWT_REFRESH_MAX_AGE_DAYS, 7)
  ),
  mfaCodeMaxAgeMs: minutes(
    toNumber(process.env.MFA_CODE_MAX_AGE_MINUTES, 2)
  ),
  passwordResetMaxAgeMs: minutes(
    toNumber(process.env.PASSWORD_RESET_MAX_AGE_MINUTES, 15)
  ),
  maxFailedLoginAttempts: toNumber(process.env.MAX_FAILED_LOGIN_ATTEMPTS, 3),
  accountLockMs: days(toNumber(process.env.ACCOUNT_LOCK_DAYS, 1)),
  frontendResetUrl:
    process.env.FRONTEND_RESET_URL ||
    "http://localhost:5173/reset-password",
  cookieNames: {
    accessToken: process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken",
    refreshToken: process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken",
  },
  cookieOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
  },
};

export default authConfig;
