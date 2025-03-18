import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Cart from '@/models/Cart';
import mongoose from 'mongoose';

interface Params {
  params: {
    id: string;
  }
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid cart ID' }, { status: 400 });
    }
    
    const cart = await Cart.findById(id).populate('items.product');
    
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();
    
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid cart ID' }, { status: 400 });
    }
    
    // If updating items, recalculate total
    if (body.items) {
      body.total = body.items.reduce(
        (total: number, item: { price: number; quantity: number }) => 
          total + (item.price * item.quantity), 
        0
      );
    }
    
    const cart = await Cart.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate('items.product');
    
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid cart ID' }, { status: 400 });
    }
    
    // Instead of deleting, clear the cart
    const cart = await Cart.findByIdAndUpdate(
      id,
      { items: [], total: 0 },
      { new: true }
    );
    
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}