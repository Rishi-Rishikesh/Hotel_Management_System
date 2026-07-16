import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    console.log("Attempting MongoDB connection...");

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URI2;
    if (!mongoUri) {
      throw new Error("No MongoDB URI configured. Set MONGO_URI or MONGODB_URI in .env.");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected successfully.");
  } catch (error) {
    console.error("❌ Database Connection Unsuccessful:", error.message);
    process.exit(1);
  }
};

export default connectDB;
