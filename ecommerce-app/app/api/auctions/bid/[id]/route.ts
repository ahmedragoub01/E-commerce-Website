import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Auction from '@/models/Auction';
import User from '@/models/User';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

interface BidRequestBody {
    userEmail: string;
    amount: number;
}

export async function POST(request: NextRequest, context: { params: { id: string } }) {
    try {
        await connectDB();
        
        const { id } = await context.params;
        
        // Ensure request body is valid before destructuring
        const body = await request.json().catch(() => ({}));
        const { userEmail, amount } = body as BidRequestBody;
        
        // Validate auction ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid auction ID' }, { status: 400 });
        }
        
        // Validate email
        if (!userEmail) {
            return NextResponse.json({ error: 'User email is required' }, { status: 400 });
        }

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
            return NextResponse.json({ error: 'Bid amount must be greater than current price' }, { status: 400 });
        }
        
        // Fetch user from the database by email
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        // Add bid to auction with user ObjectId reference
        auction.bids.push({
            user: user._id,
            amount,
            timestamp: new Date()
        });
        
        // Update current price
        auction.currentPrice = amount;
        
        await auction.save();
        
        return NextResponse.json({
            message: 'Bid placed successfully',
            currentPrice: auction.currentPrice
        }, { status: 200 });
    } catch (error) {
        console.error('Error placing bid:', error);
        return NextResponse.json({ error: 'Failed to place bid' }, { status: 500 });
    }
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
    try {
        await connectDB();
        
        const { id } = await context.params;
        
        // Validate auction ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid auction ID' }, { status: 400 });
        }
        
        const auction = await Auction.findById(id)
            .populate('product')
            .populate({
                path: 'bids.user',
                select: 'name email'
            })
            .populate('winner', 'name email');
            
        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }
            
        return NextResponse.json({ auction }, { status: 200 });
    } catch (error) {
        console.error('Error fetching auction:', error);
        return NextResponse.json({ error: 'Failed to fetch auction' }, { status: 500 });
    }
}