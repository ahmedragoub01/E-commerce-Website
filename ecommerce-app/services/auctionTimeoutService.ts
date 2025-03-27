// src/services/auctionTimeoutService.ts
import cron from 'node-cron';
import { connectDB } from "@/lib/mongodb";
import Auction from '@/models/Auction';

export async function checkAuctionTimeouts() {
  try {
    // Ensure database connection
    await connectDB();

    // Find auctions that are ended, not paid, and past the timeout window
    const timeoutThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const unpaidAuctions = await Auction.find({
      status: 'ended',
      isPaid: false,
      endTime: { $lt: timeoutThreshold }
    });

    for (const auction of unpaidAuctions) {
      // Logic to reassign or handle timeout
      const bids = auction.bids
        .filter(bid => bid.user.toString() !== auction.winner.toString())
        .sort((a, b) => b.amount - a.amount);

      if (bids.length > 0) {
        // Reassign to next highest bidder
        auction.winner = bids[0].user;
        auction.status = 'ended';
      } else {
        // No other bids, complete auction
        auction.winner = undefined;
        auction.status = 'completed';
      }

      // Mark as processed to prevent repeated checks
      auction.timeoutProcessed = true;
      await auction.save();

      console.log(`Processed timeout for auction ${auction._id}`);
    }
  } catch (error) {
    console.error('Auction timeout check failed:', error);
  }
}

// Initialize cron job
export function initAuctionTimeoutJob() {
  // Schedule the job to run every hour
  cron.schedule('0 * * * *', checkAuctionTimeouts);

  // Optional: Initial run on server start
  checkAuctionTimeouts();
}