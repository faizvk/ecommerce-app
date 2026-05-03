// controllers/user.controller.js
import crypto from "crypto";
import User from "../model/user.model.js";
import {
  createAccessToken,
  createRefreshToken,
} from "../auth/auth.middleware.js";
import { sendEmail } from "../utils/sendEmail.js";
import { CLIENT_URL } from "../config/env.js";

/* SIGNUP */
export const signup = async (req, res) => {
  try {
    const userData = req.body;

    if (!userData.email || !userData.password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const newUser = new User({
      ...userData,
      role: userData.role || "user",
    });

    const createdUser = await newUser.save();
    const sanitizedUser = createdUser.toObject();
    delete sanitizedUser.password;

    res.status(201).json({
      message: "User created successfully",
      success: true,
      user: sanitizedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

/* LOGIN */
/**
 * LOGIN
 *
 * Hardening:
 *  - Generic 401 for both "no user" and "wrong password" so attackers can't
 *    enumerate accounts.
 *  - Failed attempts increment a counter; after MAX_ATTEMPTS the account is
 *    soft-locked for LOCK_DURATION. Counter resets on success.
 *  - Returns ACCOUNT_LOCKED (423) with the unlock time when locked.
 */
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    let user = await User.findOne({ email })
      .select("+password +provider +failedLoginAttempts +lockedUntil");

    if (!user) {
      // Mimic the timing of a real password check to avoid timing-based enumeration
      await new Promise((r) => setTimeout(r, 200));
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Account locked?
    if (user.isLocked()) {
      const retryAfter = Math.ceil((user.lockedUntil - Date.now()) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(423).json({
        success: false,
        error: {
          code: "ACCOUNT_LOCKED",
          message: `Account locked due to too many failed attempts. Try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
        },
        lockedUntil: user.lockedUntil,
      });
    }

    // Google-only account
    if (user.provider === "google" && !user.password) {
      return res.status(403).json({
        message: "ACCOUNT_HAS_NO_PASSWORD",
        provider: "google",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Record failure
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const update = { $set: { failedLoginAttempts: attempts } };
      if (attempts >= MAX_ATTEMPTS) {
        update.$set.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        update.$set.failedLoginAttempts = 0; // reset counter when locking
      }
      await User.updateOne({ _id: user._id }, update);

      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Success — reset attempts + lock state
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await User.updateOne(
        { _id: user._id },
        { $set: { failedLoginAttempts: 0, lockedUntil: null } }
      );
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    user = user.toObject();
    delete user.password;
    delete user.failedLoginAttempts;
    delete user.lockedUntil;

    res.status(200).json({
      message: "Login successful",
      success: true,
      accessToken,
      user,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

/* REFRESH ACCESS TOKEN */
export const refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.refreshUser.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newAccessToken = createAccessToken(user);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: "Refresh failed" });
  }
};

/* LOGOUT */
export const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully", success: true });
};

/* UPDATE PASSWORD */
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findById(req.user.id).select("+password +provider");

    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("Provider:", user.provider);
    console.log("Has password:", Boolean(user.password));

    // 🚫 Google-only users
    if (user.provider === "google" && !user.password) {
      return res.status(403).json({
        message: "GOOGLE_ACCOUNT_NO_PASSWORD",
      });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch)
      return res.status(401).json({ message: "Old password is incorrect" });

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Password update failed",
      error: error.message,
    });
  }
};

/* SET PASSWORD */
export const setPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword)
      return res.status(400).json({ message: "New password is required" });

    const user = await User.findById(req.user.id).select("+password +provider");

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.provider !== "google") {
      return res.status(400).json({ message: "Password already exists" });
    }

    user.password = newPassword;
    user.provider = "local";
    await user.save();

    res.status(200).json({
      message: "Password set successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Set password failed",
      error: error.message,
    });
  }
};

/* GET PROFILE */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      success: true,
      user,
      isProfileComplete: user.isProfileComplete(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

/* UPDATE PROFILE */
export const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ["name", "age", "address", "contact"];
    const updates = {};

    for (const key of Object.keys(req.body)) {
      if (allowedUpdates.includes(key)) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: "No valid fields to update" });

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: updatedUser,
      isProfileComplete: updatedUser.isProfileComplete(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Profile update failed",
      error: error.message,
    });
  }
};

/* FORGOT PASSWORD */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    // Always respond 200 to prevent email enumeration
    if (!user) {
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${CLIENT_URL}/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset — MyStore",
      html: `
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in <strong>1 hour</strong>.</p>
        <p>If you did not request this, ignore this email.</p>
      `,
    });

    return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
};

/* RESET PASSWORD */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword)
      return res.status(400).json({ message: "Token and new password are required" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpiry +password");

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Password reset failed", error: error.message });
  }
};

/* ADMIN – LIST ALL USERS */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ADMIN – UPDATE USER ROLE */
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch {
    res.status(500).json({ message: "Failed to update role" });
  }
};
