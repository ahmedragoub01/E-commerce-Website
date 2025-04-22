// app/api/products/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Product from '@/models/Product';
import Category from '@/models/Category';
import mongoose from 'mongoose';
import fs, { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const isAuction = searchParams.get('isAuction');
        const sortBy = searchParams.get('sortBy');
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        
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
        
        // Apply limit if provided
        if (limit) {
            productsQuery = productsQuery.limit(limit);
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
        
        const product = new Product({
            name: body.name,
            description: body.description,
            price: parseFloat(body.price),
            inventory: parseInt(body.inventory),
            category: body.category,
            isAuction: body.isAuction || false,
            images: [] // Will be populated after upload
        });

        await product.save();

        console.log('Product created:', body.images.length);
        const imageUrls: string[] = [];
        if (body.images && body.images.length > 0) {
            const uploadDir = path.join(process.cwd(), 'public', 'Products', product._id.toString());
            
            try {
              await mkdir(uploadDir, { recursive: true});
              
              for (const [index, base64Image] of body.images.entries()) {
                // Extract the base64 data
                const matches = base64Image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
                if (!matches || matches.length !== 3) {
                  continue; // Skip invalid images
                }
                
                const fileExtension = matches[1].split('/')[1];
                const buffer = Buffer.from(matches[2], 'base64');
                const filename = `${Date.now()}-${index}.${fileExtension}`;
                const filePath = path.join(uploadDir, filename);
                
                await writeFile(filePath, buffer);
                imageUrls.push(`${product._id}/${filename}`);
              }
              
              // Update product with image URLs
              product.images = imageUrls;
              await product.save();
            } catch (uploadError) {
                // If upload fails, delete the product
                await Product.findByIdAndDelete(product._id);
                throw uploadError;
            }
        }
        
        
        // Return the product with populated category
        const savedProduct = await Product.findById(product._id).populate('category');
        
        return NextResponse.json(savedProduct, { status: 201 });

    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
