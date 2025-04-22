"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Award,
  History,
  TrendingUp,
  ChevronLeft,
} from "lucide-react";

// Define proper types
interface User {
  id: string;
  name: string;
  email: string;
}

interface Bid {
  id: string;
  amount: number;
  timestamp: string;
  user: User;
}

interface Product {
  id: string;
  name: string;
  description: string;
  images?: string[];
}

interface Auction {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  endDate: string;
  status: "active" | "ended" | "upcoming";
  product: Product;
  bids: Bid[];
  winner?: User;
}

interface ApiResponse {
  auction: Auction;
}

// Custom fetcher with error handling
const fetcher = async (url: string): Promise<ApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Failed to fetch auction data");
    throw error;
  }
  return res.json();
};

// Get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return {
        gradient: "from-green-700 to-green-600",
        badge: "bg-white/20",
        text: "text-green-800",
      };
    case "upcoming":
      return {
        gradient: "from-blue-700 to-blue-600",
        badge: "bg-white/20",
        text: "text-blue-800",
      };
    case "ended":
      return {
        gradient: "from-red-700 to-red-600",
        badge: "bg-white/20",
        text: "text-red-800",
      };
    default:
      return {
        gradient: "from-blue-600 to-indigo-600",
        badge: "bg-white/20",
        text: "text-blue-700",
      };
  }
};

// Timer component with improved display
const Timer: React.FC<{ endDate: string; isUpcoming?: boolean }> = ({
  endDate,
  isUpcoming = false,
}) => {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(endDate);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0 && !isUpcoming) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTime({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endDate, isUpcoming]);

  const getTimerColor = () => {
    if (isUpcoming) return "text-blue-600";
    return "text-green-600";
  };

  return (
    <div className="flex space-x-2 items-center">
      <CalendarClock className="h-5 w-5 text-white" />
      <div className="flex space-x-1">
        {time.days > 0 && (
          <TimeBlock value={time.days} label="D" color={getTimerColor()} />
        )}
        <TimeBlock value={time.hours} label="H" color={getTimerColor()} />
        <TimeBlock value={time.minutes} label="M" color={getTimerColor()} />
        <TimeBlock value={time.seconds} label="S" color={getTimerColor()} />
      </div>
    </div>
  );
};

// Time block for timer
const TimeBlock: React.FC<{ value: number; label: string; color: string }> = ({
  value,
  label,
}) => {
  return (
    <div className="flex items-baseline">
      <span className="font-mono  text-xl font-bold">
        {value.toString().padStart(2, "0")}
      </span>
      <span className={`text-xs white font-medium ml-1`}>{label}</span>
    </div>
  );
};

// Enhanced Auction Details component
const AuctionDetails: React.FC<{
  auction: Auction;
}> = ({ auction }) => {
  const isActive = auction.status === "active";
  const isEnded = auction.status === "ended";
  const isUpcoming = auction.status === "upcoming";
  const statusColors = getStatusColor(auction.status);

  // Calculate percentage increase from starting price
  const priceIncrease =
    auction.startingPrice > 0
      ? (
          ((auction.currentPrice - auction.startingPrice) /
            auction.startingPrice) *
          100
        ).toFixed(1)
      : "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="mb-6 border border-indigo-100 shadow-md overflow-hidden">
        <div
          className={`bg-gradient-to-r ${statusColors.gradient} text-white p-6`}
        >
          <h2 className="text-2xl font-bold">{auction.title}</h2>
          <div className="mt-2 flex items-center">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors.badge} backdrop-blur-sm`}
            >
              {auction.status.toUpperCase()}
            </span>

            {isActive && (
              <div className="ml-auto">
                <Timer endDate={auction.endDate} />
              </div>
            )}

            {isUpcoming && (
              <div className="ml-auto">
                <Timer endDate={auction.endDate} isUpcoming={true} />
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {auction.product.name}
            </h3>
            <p className="mt-2 text-gray-600 leading-relaxed">
              {auction.product.description || auction.description}
            </p>
          </div>

          {auction.product.images?.[0] ? (
            <motion.div
              className="mb-6 relative h-80 w-full rounded-lg overflow-hidden shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={`/Products/${auction.product.images[0]}`}
                alt={auction.product.name}
                fill
                style={{ objectFit: "contain" }}
                className="rounded-lg bg-gray-50"
                priority
                unoptimized
              />
            </motion.div>
          ) : (
            <div className="mb-6 relative h-80 w-full bg-gray-50 rounded-lg flex items-center justify-center shadow-inner">
              <p className="text-gray-400">No image available</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Starting Price:</span>
                <span className="font-medium">
                  ${auction.startingPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-800 font-medium">Current Bid:</span>
                <div className="flex items-center">
                  <span
                    className={`text-xl font-bold ${
                      isActive
                        ? "text-green-700"
                        : isUpcoming
                        ? "text-blue-700"
                        : isEnded
                        ? "text-red-700"
                        : "text-gray-700"
                    }`}
                  >
                    ${auction.currentPrice.toFixed(2)}
                  </span>
                  {auction.currentPrice > auction.startingPrice && (
                    <div className="ml-2 flex items-center text-green-600 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {priceIncrease}%
                    </div>
                  )}
                </div>
              </div>

              {auction.bids && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-gray-600 text-sm">
                  {auction.bids.length}{" "}
                  {auction.bids.length === 1 ? "bid" : "bids"} so far
                </div>
              )}
            </div>

            {isEnded && auction.winner && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-center">
                <Award className="h-6 w-6 text-amber-600 mr-3" />
                <div>
                  <p className="text-amber-800 font-medium">Winning Bid</p>
                  <p className="text-amber-700">
                    <span className="font-bold">{auction.winner.name}</span> won
                    this auction
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced Bid Form
const BidForm: React.FC<{
  auction: Auction;
  onBidSubmit: (amount: number) => Promise<void>;
  isSubmitting: boolean;
}> = ({ auction, onBidSubmit, isSubmitting }) => {
  const [bidAmount, setBidAmount] = useState("");
  const minBid = auction.currentPrice + 0.01;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    if (!isNaN(amount)) {
      await onBidSubmit(amount);
      setBidAmount("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="border border-green-100 shadow-md overflow-hidden">
        <div className="bg-green-50 p-4">
          <CardTitle className="flex items-center text-green-800">
            <TrendingUp className="h-5 w-5 mr-2" />
            Place Your Bid
          </CardTitle>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="bid" className="text-gray-700 font-medium">
                Bid Amount
              </Label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="bid"
                  type="number"
                  className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
                  placeholder={`${minBid.toFixed(2)} or higher`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  step="0.01"
                  min={minBid}
                  aria-describedby="bid-requirements"
                />
              </div>
              <p
                id="bid-requirements"
                className="text-sm text-green-600 mt-2 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Minimum bid: ${minBid.toFixed(2)}
              </p>
            </div>

            <Button
              type="submit"
              className="bg-green-700 hover:bg-green-800 text-white transition-all"
              disabled={
                isSubmitting ||
                !bidAmount ||
                parseFloat(bidAmount) <= auction.currentPrice
              }
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Place Bid"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced Bid History
const BidHistory: React.FC<{ bids: Bid[] }> = ({ bids }) => {
  const sortedBids = useMemo(
    () =>
      [...bids].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [bids]
  );

  if (sortedBids.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mt-6"
    >
      <Card className="border border-green-100 shadow-md overflow-hidden">
        <div className="bg-green-50 p-4">
          <CardTitle className="flex items-center text-green-800">
            <History className="h-5 w-5 mr-2" />
            Bid History
          </CardTitle>
        </div>

        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {sortedBids.map((bid, index) => (
              <motion.div
                key={bid.id || index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold mr-3">
                    {bid.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{bid.user.name}</p>
                    <p className="text-green-700 font-bold">
                      ${bid.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(bid.timestamp).toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main component
const AuctionPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  const { data, error, mutate, isLoading } = useSWR<ApiResponse>(
    id ? `/api/auctions/${id}` : null,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const auction = data?.auction;

  // Effect for auction expiration
  useEffect(() => {
    if (!auction || auction.status !== "active") return;

    const checkAuctionStatus = () => {
      const now = new Date();
      const end = new Date(auction.endDate);

      if (now >= end) {
        mutate();
      }
    };

    const timer = setInterval(checkAuctionStatus, 1000);
    return () => clearInterval(timer);
  }, [auction, mutate]);

  const handleBidSubmit = useCallback(
    async (bidValue: number) => {
      if (!session?.user?.email || !auction) {
        toast.error("Please sign in to place a bid.");
        return;
      }

      if (bidValue <= auction.currentPrice) {
        toast.error(
          `Your bid must be greater than the current bid of $${auction.currentPrice.toFixed(
            2
          )}.`
        );
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch(`/api/auctions/bid/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: session.user.email,
            amount: bidValue,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to place bid");
        }

        await mutate();
        toast.success(
          `Your bid of $${bidValue.toFixed(2)} was successfully placed!`,
          {
            style: {
              borderLeft: "4px solid #16a34a",
              backgroundColor: "#f0fdf4",
              color: "#166534",
            },
          }
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to place bid. Please try again.";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [auction, id, mutate, session]
  );

  // Error states
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer mb-6 flex items-center gap-1 hover:text-indigo-600 transition-all duration-100 transform hover:scale-[1.05]"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg shadow-lg p-8 bg-white border border-red-100"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Unable to Load Auction
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't retrieve the auction data. Please try again.
            </p>
            <Button
              onClick={() => mutate()}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all"
            >
              Retry
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !auction) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer mb-6 flex items-center gap-1 hover:text-indigo-600 transition-all duration-100 transform hover:scale-[1.05]"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="mb-6 border border-gray-100 shadow-md overflow-hidden">
          <div className="bg-gray-100 p-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/4 mt-3" />
          </div>

          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-6" />

            <Skeleton className="h-80 w-full mb-6 rounded-lg" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          </CardContent>
        </Card>

        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  const isActive = auction.status === "active";
  const isUpcoming = auction.status === "upcoming";
  const isEnded = auction.status === "ended";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" aria-live="polite">
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer mb-6 flex items-center gap-1 hover:text-indigo-600 transition-all duration-100 transform hover:scale-[1.05]"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <AuctionDetails auction={auction} />

      {isActive && session ? (
        <BidForm
          auction={auction}
          onBidSubmit={handleBidSubmit}
          isSubmitting={isSubmitting}
        />
      ) : isUpcoming || isEnded ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card
            className={`border shadow-md overflow-hidden ${
              isUpcoming
                ? "border-blue-100"
                : isEnded
                ? "border-red-100"
                : "border-gray-100"
            }`}
          >
            <CardContent className="p-6 flex items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 ${
                  isUpcoming
                    ? "bg-blue-50 text-blue-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {isUpcoming ? (
                  <CalendarClock className="h-5 w-5" />
                ) : (
                  <Award className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isUpcoming
                    ? "This auction has not started yet."
                    : "This auction has ended."}
                </p>
                {isUpcoming ? (
                  <div className="flex items-center mt-2">
                    <span className="text-gray-500 text-sm mr-3">
                      Starts in:
                    </span>
                    <Timer endDate={auction.endDate} isUpcoming={true} />
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    The auction ended on{" "}
                    {new Date(auction.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : isActive ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border border-green-100 shadow-md overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between">
                <div className="mb-4 sm:mb-0 text-center sm:text-left">
                  <p className="text-lg font-medium text-gray-800">
                    Please sign in to place a bid on this auction.
                  </p>
                  <p className="text-gray-600">
                    You must be logged in to participate.
                  </p>
                </div>
                <Button
                  className="bg-green-700 hover:bg-green-800 text-white transition-all"
                  onClick={() => (window.location.href = "/api/auth/signin")}
                >
                  Sign In to Bid
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      <BidHistory bids={auction.bids || []} />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "0.5rem",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
        }}
      />
    </div>
  );
};

export default AuctionPage;
