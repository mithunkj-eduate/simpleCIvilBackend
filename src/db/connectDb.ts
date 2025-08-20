import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    // const mongoUrl = process.env.MONGO_URL;
    // console.log("MongoDB URL:", mongoUrl);
    // if (!mongoUrl) {
    //   throw new Error("MONGO_URL is not defined in environment variables.");
    // }

    await mongoose.connect('mongodb://127.0.0.1:27017/test')
  
    // await mongoose.connect(mongoUrl);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1); // Exit the process if DB connection fails
  }
};

export default connectDB;
