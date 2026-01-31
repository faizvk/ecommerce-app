// controllers/user.controller.js
import User from "../model/user.model.js";
import {
  createAccessToken,
  createRefreshToken,
} from "../auth/auth.middleware.js";

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
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    let user = await User.findOne({ email }).select("+password +provider");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Google-only account fallback
    if (user.provider === "google" && !user.password) {
      return res.status(403).json({
        message: "ACCOUNT_HAS_NO_PASSWORD",
        provider: "google",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    user = user.toObject();
    delete user.password;

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
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
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
