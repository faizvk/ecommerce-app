import jwt from "jsonwebtoken";
import { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } from "../config/env.js";

const accessSecret = ACCESS_SECRET_KEY;
const refreshSecret = REFRESH_SECRET_KEY;

const createAccessToken = (user) => {
  let token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    accessSecret,
    {
      expiresIn: "15m",
      algorithm: "HS256",
      issuer: "faiz",
    }
  );
  return token;
};

const createRefreshToken = (user) => {
  let token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    refreshSecret,
    {
      expiresIn: "7d",
      algorithm: "HS256",
      issuer: "faiz",
    }
  );
  return token;
};

const verifyToken = (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "NO TOKEN FOUND.",
      });
    }

    const decoded = jwt.verify(token, accessSecret);

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "err : invalid token",
    });
  }
};
const verifyRefreshToken = (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(token, refreshSecret);
    req.refreshUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

export {
  createAccessToken,
  createRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
