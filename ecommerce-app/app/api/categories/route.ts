// app/api/categories/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const categories = await Category.find({});
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const category = new Category(body);
        await category.save();
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}