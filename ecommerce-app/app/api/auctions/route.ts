import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Auction from '@/models/Auction';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        
        // Build query
        const query: { status?: string } = {};
        if (status) query.status = status;
        
        const auctions = await Auction.find(query)
            .populate('product')
            .populate('bids.user', 'name email')
            .populate('winner', 'name email');
        
        return NextResponse.json(auctions);
    } catch (error) {
        console.error('Error fetching auctions:', error);
        return NextResponse.json({ error: 'Failed to fetch auctions' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        
        // Set initial values
        body.currentPrice = body.startingPrice;
        
        // Set status based on dates
        const now = new Date();
        if (new Date(body.startDate) <= now && new Date(body.endDate) >= now) {
            body.status = 'active';
        } else if (new Date(body.startDate) > now) {
            body.status = 'upcoming';
        } else {
            body.status = 'ended';
        }
        
        const auction = new Auction(body);
        await auction.save();
        
        return NextResponse.json(auction, { status: 201 });
    } catch (error) {
        console.error('Error creating auction:', error);
        return NextResponse.json({ error: 'Failed to create auction' }, { status: 500 });
    }
}