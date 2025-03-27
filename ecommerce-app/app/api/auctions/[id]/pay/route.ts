import { NextResponse } from 'next/server';
import Auction from '@/models/Auction';
import { connectDB } from "@/lib/mongodb";
import mongoose from 'mongoose';

export async function PUT(request: Request) {
  try {
    await connectDB();

    // Try to extract auctionId from the request body
    const body = await request.json();
    const auctionId = body.auctionId || body.id;

    if (!auctionId) {
      return NextResponse.json({ message: "Auction ID is required" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return NextResponse.json({ message: "Invalid auction ID" }, { status: 400 });
    }

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return NextResponse.json({ message: "Auction not found" }, { status: 404 });
    }

    // Check if auction is already paid to prevent duplicate updates
    if (auction.isPaid) {
      return NextResponse.json({ 
        message: "Auction is already paid", 
        auction: auction 
      }, { status: 200 });
    }

    // Update the auction as paid
    auction.isPaid = true;
    auction.paidAt = new Date();
    
    await auction.save();

    return NextResponse.json({ 
      message: "Auction payment status updated", 
      auction: auction 
    }, { status: 200 });

  } catch (error) {
    console.error("Auction payment update error:", error);
    return NextResponse.json({ 
      message: "Failed to update auction payment status", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}