import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    console.log("Attempting MongoDB connection...");

    await mongoose.connect(process.env.MONGO_URI); // No options needed anymore
    console.log("✅ MongoDB connected successfully.");
  } catch (error) {
    console.error("❌ Database Connection Unsuccessful:", error.message);
    process.exit(1);
  }
};

export default connectDB;
