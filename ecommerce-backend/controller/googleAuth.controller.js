import { googleClient } from "../utils/googleClient.js";
import User from "../model/user.model.js";
import {
  createAccessToken,
  createRefreshToken,
} from "../auth/auth.middleware.js";

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // New Google user
      user = await User.create({
        name,
        email,
        googleId: sub,
        provider: "google",
        role: "user",
      });
    } else if (!user.googleId) {
      // Link existing local account
      user.googleId = sub;
      user.provider = "google";
      await user.save();
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      user,
      accessToken,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Google authentication failed" });
  }
};
