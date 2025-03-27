import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import mongoose, { Types } from 'mongoose';

interface RemoveItemBody {
  userId: string;
  productId: string;
  quantity?: number;
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    
    const { userId, productId, quantity }: RemoveItemBody = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid user or product ID' }, { status: 400 });
    }
    
    const cart = await Cart.findOne({ user: new Types.ObjectId(userId) });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    
    const itemIndex: number = cart.items.findIndex((item: { product: { toString: () => string; }; }) => item.product.toString() === productId);
    if (itemIndex === -1) return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    
    if (quantity && quantity < cart.items[itemIndex].quantity) {
      cart.items[itemIndex].quantity -= quantity;
    } else {
      cart.items.splice(itemIndex, 1);
    }
    
    cart.total = cart.items.reduce((total: number, item: { price: number; quantity: number }) => total + item.price * item.quantity, 0);
    await cart.save();
    await cart.populate('items.product');
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json({ error: 'Failed to remove item from cart' }, { status: 500 });
  }
}
