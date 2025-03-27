import { NextResponse } from 'next/server';
import Auction from '@/models/Auction';
import { connectDB } from "@/lib/mongodb";
import mongoose from 'mongoose';

export async function PUT(
  request: Request,
  { params }: { params: { auctionId: string } }
) {
  try {
    await connectDB();

    const auctionId = params.auctionId;

    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return NextResponse.json({ message: "Invalid auction ID" }, { status: 400 });
    }

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return NextResponse.json({ message: "Auction not found" }, { status: 404 });
    }

    if (auction.status !== "ended") {
      return NextResponse.json({ message: "Auction is not ended" }, { status: 400 });
    }

    if (auction.isPaid) {
      return NextResponse.json({ message: "Auction already paid" }, { status: 400 });
    }

    if (!auction.winner) {
      return NextResponse.json({ message: "No winner found" }, { status: 400 });
    }

    // Reassign winner logic
    const currentWinnerId = auction.winner.toString();
    const bids = auction.bids
      .filter(bid => bid.user.toString() !== currentWinnerId)
      .sort((a, b) => b.amount - a.amount);

    if (bids.length > 0) {
      // Reassign to the next highest bidder
      auction.winner = bids[0].user;
      auction.status = "ended"; // Keep status as ended
      await auction.save();
      return NextResponse.json({ 
        message: "Winner reassigned", 
        newWinnerId: bids[0].user.toString() 
      }, { status: 200 });
    } else {
      // If there are no other bids, mark as completed with no winner
      auction.winner = undefined;
      auction.status = "completed";
      await auction.save();
      return NextResponse.json({ 
        message: "No other bids, auction completed with no winner" 
      }, { status: 200 });
    }
  } catch (error) {
    console.error("Payment timeout error:", error);
    return NextResponse.json({ message: "Payment timeout failed" }, { status: 500 });
  }
}