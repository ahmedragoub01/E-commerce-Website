import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import mongoose from 'mongoose';

interface AddItemBody {
  userId: string;
  productId: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId, productId, quantity }: AddItemBody = await request.json();
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    
    // Check if quantity is valid
    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
    }
    
    // Get product
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Check if product is available
    if (product.inventory < quantity) {
      return NextResponse.json({ 
        error: 'Not enough inventory available' 
      }, { status: 400 });
    }
    
    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        total: 0
      });
    }
    
    // Check if product already exists in cart
    const itemIndex = cart.items.findIndex(
      (item: { product: mongoose.Types.ObjectId; quantity: number; price: number }) => item.product.toString() === productId
    );
    
    if (itemIndex > -1) {
      // Update existing item
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: new mongoose.Types.ObjectId(productId),
        quantity,
        price: product.price
      });
    }
    
    // Recalculate total
    cart.total = cart.items.reduce(
      (total: number, item: { price: number; quantity: number }) => total + (item.price * item.quantity), 
      0
    );
    
    await cart.save();
    
    // Populate product details for response
    await cart.populate('items.product');
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
  }
}