import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Auction from '@/models/Auction';
import User from '@/models/User';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await context.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid auction ID' }, { status: 400 });
        }

        const auction = await Auction.findById(id)
            .populate('product')
            .populate('bids.user', 'name email');

        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        return NextResponse.json({ auction }, { status: 200 });
    } catch (error) {
        console.error('Error fetching auction:', error);
        return NextResponse.json({ error: 'Failed to fetch auction' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await context.params;
        const body = await request.json();

        let auction = await Auction.findById(id).populate('bids.user');
        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        // If auction is ending, determine the winner
        if (body.status === 'ended' && auction.bids.length > 0) {
            const highestBid = auction.bids.reduce((max, bid) => bid.amount > max.amount ? bid : max, auction.bids[0]);
            auction.winner = highestBid.user._id;
            await auction.save();

            // Add product to winner's cart
            let winner = await User.findById(auction.winner);
            if (!winner.cart) winner.cart = [];
            winner.cart.push({ product: auction.product, price: highestBid.amount });
            await winner.save();

            // Set a timeout to handle payment failure
            setTimeout(async () => {
                const updatedAuction = await Auction.findById(id);
                if (updatedAuction?.status === 'ended' && updatedAuction.winner) {
                    const winnerUser = await User.findById(updatedAuction.winner);
                    if (!winnerUser.paymentConfirmed) {
                        winnerUser.isBlacklisted = true;
                        await winnerUser.save();
                    }
                }
            }, 2 * 60 * 1000); // 2 minutes
        }

        auction = await Auction.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        return NextResponse.json(auction);
    } catch (error) {
        console.error('Error updating auction:', error);
        return NextResponse.json({ error: 'Failed to update auction' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await context.params;
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
