// app/api/products/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Product from '@/models/Product';
import mongoose from 'mongoose';

interface Params {
    id: string;
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        await connectDB();
        
        const { id } = params;
        const product = await Product.findById(id).populate('category');
        
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        
        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
    try {
        await connectDB();
        
        const { id } = params;
        const body = await request.json();
        
        // Validate category if it's being updated
        if (body.category && !mongoose.Types.ObjectId.isValid(body.category)) {
            return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
        }
        
        const product = await Product.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        ).populate('category');
        
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        
        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    try {
        await connectDB();
        
        const { id } = params;
        const product = await Product.findById(id);
        
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        
        await Product.findByIdAndDelete(id);
        
        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}