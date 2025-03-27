import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Cart from "@/models/Cart";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // For GET requests, use URL parameters instead of body
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    return NextResponse.json(cart || { items: [], total: 0 });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    return NextResponse.json({ error: "Failed to retrieve cart" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId } = await request.json();

    // Validate userId
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Check if the user already has a cart
    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    // If no cart exists, create a new one
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        total: 0,
      });
      await cart.save();
    }

    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    console.error("Error creating/retrieving cart:", error);
    return NextResponse.json({ error: "Failed to process cart" }, { status: 500 });
  }
}