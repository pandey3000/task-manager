import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in environment variables");
  }

  console.log("Attempting to connect to MongoDB...");
  console.log("MONGO_URI:", process.env.MONGO_URI.replace(/\/\/.*@/, "//***:***@")); // Hide credentials

  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}
