
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Order from '@/models/Order';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';

interface Params {
    params: {
        id: string;
    };
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        await connectDB();
        
        const { id } = await params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
        }

        const order = await Order.findById(id)
            .populate('user', 'name email')
            .populate('items.product');
        
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        
        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: Params) {
    try {
        await connectDB();
        
        const { id } = await params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
        }

        const body = await request.json();
        
        const order = await Order.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );
        
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        
        return NextResponse.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
