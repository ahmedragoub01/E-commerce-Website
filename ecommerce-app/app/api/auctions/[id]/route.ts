import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Auction from '@/models/Auction';
import { ObjectId } from 'mongoose';

interface Params {
    params: {
        id: string;
    };
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        await connectDB();
        
        const { id } = params;
        const auction = await Auction.findById(id)
            .populate('product')
            .populate('bids.user', 'name email')
            .populate('winner', 'name email');
        
        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }
        
        return NextResponse.json(auction);
    } catch (error) {
        console.error('Error fetching auction:', error);
        return NextResponse.json({ error: 'Failed to fetch auction' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: Params) {
    try {
        await connectDB();
        
        const { id } = params;
        const body = await request.json();
        
        const auction = await Auction.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );
        
        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }
        
        return NextResponse.json(auction);
    } catch (error) {
        console.error('Error updating auction:', error);
        return NextResponse.json({ error: 'Failed to update auction' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        await connectDB();
        
        const { id } = params;
        const auction = await Auction.findByIdAndDelete(id);
        
        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Auction deleted successfully' });
    } catch (error) {
        console.error('Error deleting auction:', error);
        return NextResponse.json({ error: 'Failed to delete auction' }, { status: 500 });
    }
}