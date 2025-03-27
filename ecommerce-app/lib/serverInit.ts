// src/lib/serverInit.ts
import { initAuctionTimeoutJob } from '@/services/auctionTimeoutService';

export function initializeServerServices() {
  // Initialize auction timeout job
  initAuctionTimeoutJob();

  // You can add other server-side initializations here
}