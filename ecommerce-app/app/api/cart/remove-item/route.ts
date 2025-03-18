import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Cart from '@/models/Cart';
import mongoose from 'mongoose';

interface RemoveItemBody {
  userId: string;
  productId: string;
  quantity?: number; // Optional - if provided, reduces quantity by this amount
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId, productId, quantity }: RemoveItemBody = await request.json();
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    
    // Get cart
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }
    
    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item: { product: mongoose.Types.ObjectId }) => item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }
    
    // If quantity is provided, reduce quantity, otherwise remove the item
    if (quantity && quantity < cart.items[itemIndex].quantity) {
      cart.items[itemIndex].quantity -= quantity;
    } else {
      // Remove the item completely
      cart.items.splice(itemIndex, 1);
    }
    
    // Recalculate total
    cart.total = cart.items.reduce(
      (total: number, item: { price: number, quantity: number }) => total + (item.price * item.quantity), 
      0
    );
    
    await cart.save();
    
    // Populate product details for response
    await cart.populate('items.product');
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json({ error: 'Failed to remove item from cart' }, { status: 500 });
  }
}