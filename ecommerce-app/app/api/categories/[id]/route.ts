// app/api/categories/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Category from '@/models/Category';

interface Params {
    id: string;
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        await connectDB();
        const { id } = await params;
        const category = await Category.findById(id);
        
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        
        return NextResponse.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();
        
        const category = await Category.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );
        
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        
        return NextResponse.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    try {
        await connectDB();
        const { id } = await params;
        const category = await Category.findByIdAndDelete(id);
        
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}