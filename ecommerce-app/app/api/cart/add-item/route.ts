import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Cart from '@/models/Cart';
import Product from '@/models/Product';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId, productId, quantity } = await request.json();

    if (!userId || !productId || quantity <= 0) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [], total: 0 });
    }

    // Check if item already exists in the cart
    const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);

    if (itemIndex !== -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    // Recalculate total price
    cart.total = cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    
    await cart.save();

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
