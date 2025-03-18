import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Cart from '@/models/Cart';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 });
    }
    
    // Find cart by user ID or create a new one
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        total: 0
      });
      await cart.save();
    }
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}