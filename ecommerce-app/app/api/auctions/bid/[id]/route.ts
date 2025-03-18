import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Auction from '@/models/Auction';
import { NextRequest } from 'next/server';

interface BidRequestBody {
    userId: string;
    amount: number;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        
        const { id } = params;
        const { userId, amount }: BidRequestBody = await request.json();
        
        const auction = await Auction.findById(id);
        
        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }
        
        // Check if auction is active
        if (auction.status !== 'active') {
            return NextResponse.json({ error: 'Auction is not active' }, { status: 400 });
        }
        
        // Check if bid amount is greater than current price
        if (amount <= auction.currentPrice) {
            return NextResponse.json({ 
                error: 'Bid amount must be greater than current price' 
            }, { status: 400 });
        }
        
        // Add bid to auction
        auction.bids.push({
            user: userId,
            amount,
            timestamp: new Date()
        });
        
        // Update current price
        auction.currentPrice = amount;
        
        await auction.save();
        
        return NextResponse.json({ 
            message: 'Bid placed successfully',
            currentPrice: auction.currentPrice 
        });
    } catch (error) {
        console.error('Error placing bid:', error);
        return NextResponse.json({ error: 'Failed to place bid' }, { status: 500 });
    }
}