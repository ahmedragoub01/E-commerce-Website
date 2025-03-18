import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/database";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return; // Already connected
    }

    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
