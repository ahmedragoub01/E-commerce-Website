// app/api/products/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const isAuction = searchParams.get('isAuction');
        const sortBy = searchParams.get('sortBy');
        
        // Build query
        const query: { [key: string]: any } = {};
        if (category) {
            // Check if category is a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(category)) {
                query.category = new mongoose.Types.ObjectId(category);
            } else {
                // Handle case where category might be passed as a name
                return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
            }
        }
        
        if (isAuction !== null) query.isAuction = isAuction === 'true';
        
        let productsQuery = Product.find(query).populate('category');
        
        // Apply sorting
        if (sortBy) {
            const sortOptions: { [key: string]: 1 | -1 } = {};
            sortOptions[sortBy] = sortBy === 'price' ? 1 : -1;
            productsQuery = productsQuery.sort(sortOptions);
        }
        
        const products = await productsQuery.exec();
        
        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        
        // Validate that category is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(body.category)) {
            return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
        }
        
        const product = new Product(body);
        await product.save();
        
        // Return the product with populated category
        const savedProduct = await Product.findById(product._id).populate('category');
        
        return NextResponse.json(savedProduct, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}