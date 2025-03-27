// Route: /api/cart/update-quantity
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Cart from "@/models/Cart";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId, productId, quantity } = await request.json();

    // Validate inputs
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Valid user ID required" }, { status: 400 });
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Valid product ID required" }, { status: 400 });
    }

    if (quantity === undefined || typeof quantity !== 'number') {
      return NextResponse.json({ error: "Valid quantity required" }, { status: 400 });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === productId
    );

    // If quantity is zero or less, remove the item
    if (quantity <= 0) {
      if (itemIndex > -1) {
        cart.items.splice(itemIndex, 1);
      }
    } 
    // If item exists, update quantity
    else if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
    } 
    // If item doesn't exist, return error
    else {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }

    // Save the updated cart
    await cart.save();

    // Return the updated cart with populated product data
    const updatedCart = await Cart.findById(cart._id).populate("items.product");
    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return NextResponse.json({ error: "Failed to update quantity" }, { status: 500 });
  }
}