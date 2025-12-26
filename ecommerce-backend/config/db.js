import mongoose from "mongoose";
import { MONGOOSE_URI } from "./env.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGOOSE_URI);

    console.log(`✅ MongoDB connected: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
