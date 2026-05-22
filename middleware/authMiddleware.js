import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import authConfig from "../config/authConfig.js";

dotenv.config();

const getCookieValue = (cookieHeader, name) => {
  if (!cookieHeader || !name) return null;

  const pairs = String(cookieHeader).split(";");

  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;

    const key = pair.slice(0, idx).trim();
    if (key !== name) continue;

    const value = pair.slice(idx + 1).trim();

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return null;
};

const extractToken = (header) => {
  if (!header) return null;

  const value = header.trim();
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

  if (jwtRegex.test(value)) return value;
  if (/^Bearer\s+/i.test(value)) {
    return value.replace(/^Bearer\s+/i, "").trim();
  }

  return null;
};

const authMiddleware = (req, res, next) => {
  const token =
    extractToken(req.headers.authorization) ||
    req.cookies?.[authConfig.cookieNames.accessToken] ||
    getCookieValue(
      req.headers.cookie,
      authConfig.cookieNames.accessToken
    );

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  if (!process.env.JWT_ACCESS_SECRET) {
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    req.user = jwt.verify(
      token.replace(/^"|"$/g, ""),
      process.env.JWT_ACCESS_SECRET
    );

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
