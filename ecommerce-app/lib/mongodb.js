import mongoose from "mongoose";
import Product from "@/models/Product"; // Import your models
import Category from "@/models/Category";
import Order from "@/models/Order";

const MONGODB_URI = "mongodb://localhost:27017/database"; // Replace with your MongoDB URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

function registerModels() {
  try {
    // Clear existing models to prevent duplicates
    delete mongoose.connection.models.Category;
    delete mongoose.connection.models.Product;
    delete mongoose.connection.models.Order;

    // Re-register models
    mongoose.model("Category", Category.schema);
    mongoose.model("Product", Product.schema);
    mongoose.model("Order", Order.schema);
  } catch (err) {
    console.error("Model registration error:", err);
  }
}

export const connectDB = async () => {
  try {
    // If already connected and ready, return
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // If connecting, wait for connection
    if (mongoose.connection.readyState === 2) {
      await new Promise((resolve) => {
        mongoose.connection.once("connected", resolve);
      });
      return mongoose.connection;
    }

    // Configure connection options
    const options = {
      bufferCommands: false, // Disable mongoose buffering
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1, // Maintain at least 1 socket connection
      retryWrites: true,
      retryReads: true,
    };

    // Add event listeners for connection management
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected");
      registerModels();
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected");
      registerModels();
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    // Actually connect
    await mongoose.connect(MONGODB_URI, options);

    // Initial model registration
    registerModels();

    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Don't exit process in Next.js - let it handle reconnections
    throw error; // Rethrow to let calling code handle
  }
};
