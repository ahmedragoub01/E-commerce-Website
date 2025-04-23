import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Order from '@/models/Order';
import Product from '@/models/Product';
import Cart from '@/models/Cart';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');
        
        // Build query
        const query: { user?: string; status?: string } = {};
        if (userId) query.user = userId;
        if (status) query.status = status;
        
        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('items.product');
        
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        const { userId, cartId, shippingAddress, paymentIntentId }: { userId: string; cartId: string; shippingAddress: any; paymentIntentId: string } = body;
        console.log('Received data:', body);
        console.log('Cart ID:',cartId);
        // Get cart items
        const cart = await Cart.findById(cartId).populate('items.product');
        
        if (!cart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }
        
        // Create order items from cart items
        const orderItems = cart.items.map((item: { product: { _id: string }; quantity: number; price: number }) => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.price
        }));
        
        const order = new Order({
            user: userId,
            items: orderItems,
            total: cart.total,
            status: 'pending',
            paymentIntentId,
            shippingAddress
        });
        
        await order.save();
        
        // Update product inventory
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(
                item.product._id,
                { $inc: { inventory: -item.quantity } }
            );
        }
        
        // Clear cart
        await Cart.findByIdAndUpdate(cartId, { items: [], total: 0 });
        
        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}