import dotenv from "dotenv";

dotenv.config();

export const {
  PORT,
  MONGOOSE_URI,
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
  CLIENT_URL,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
} = process.env;
