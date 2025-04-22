"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle,
  XCircle,
  TimerReset,
  ExternalLink,
} from "lucide-react";

// Define interfaces for type safety
interface Bid {
  _id: string;
  user: {
    _id: string;
    name?: string;
  };
  amount: number;
  timestamp: string;
}

interface Auction {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
  };
  startingPrice: number;
  currentPrice: number;
  startDate: string;
  endDate: string;
  bids: Bid[];
  winner?: {
    _id: string;
    name?: string;
  };
  status: "upcoming" | "active" | "ended" | "completed";
  isPaid: boolean;
  paymentDeadline?: string;
}

export default function MyAuctionsPage() {
  const { data: session, status } = useSession();
  const [auctions, setAuctions] = useState<Auction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentTimers, setPaymentTimers] = useState<Record<string, number>>(
    {}
  );

  // Fetch user's auction bids
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.id) {
      window.location.href = "/login";
      return;
    }

    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/auctions");
        if (!response.ok) {
          throw new Error("Failed to fetch auctions");
        }
        const allAuctions = await response.json();

        // Filter auctions where the user has placed a bid
        const userAuctions = allAuctions.filter((auction: Auction) =>
          auction.bids.some((bid) => bid.user._id === session.user.id)
        );

        setAuctions(userAuctions);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load auctions");
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [session, status]);

  // Start payment timer for won auctions that are not paid
  useEffect(() => {
    if (auctions) {
      auctions.forEach((auction) => {
        if (
          auction.status === "ended" &&
          auction.winner?._id === session?.user?.id &&
          !auction.isPaid
        ) {
          startPaymentTimer(auction._id);
        }
      });
    }
  }, [auctions, session]);

  // Start a countdown timer for payment
  const startPaymentTimer = (auctionId: string) => {
    const storedEndTime = localStorage.getItem(`paymentTimer_${auctionId}`);

    if (!storedEndTime) {
      const endTime = Date.now() + 3600000;
      localStorage.setItem(`paymentTimer_${auctionId}`, endTime.toString());
    }

    const calculateRemainingTime = () => {
      const endTime = parseInt(
        localStorage.getItem(`paymentTimer_${auctionId}`) || "0"
      );
      const timeLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000));

      setPaymentTimers((prevTimers) => ({
        ...prevTimers,
        [auctionId]: timeLeft,
      }));

      if (timeLeft <= 0) {
        handlePaymentTimeout(auctionId);
        localStorage.removeItem(`paymentTimer_${auctionId}`);
      }
    };

    calculateRemainingTime();
    const interval = setInterval(calculateRemainingTime, 1000);

    return () => clearInterval(interval);
  };

  // Handle payment timeout
  const handlePaymentTimeout = async (auctionId: string) => {
    try {
      const response = await fetch(`/api/auctions/${auctionId}/timeout`, {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error("Payment timeout failed");
      }
      const updatedAuctionsResponse = await fetch("/api/auctions");
      if (updatedAuctionsResponse.ok) {
        const allUpdatedAuctions = await updatedAuctionsResponse.json();
        const updatedUserAuctions = allUpdatedAuctions.filter(
          (auction: Auction) =>
            auction.bids.some((bid) => bid.user._id === session?.user?.id)
        );
        setAuctions(updatedUserAuctions);
        toast.warning("Payment window expired", {
          description: "Your auction item has been relisted.",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to handle payment timeout");
    }
  };

  // Render auction status badge
  const renderAuctionStatusBadge = (auction: Auction) => {
    if (auction.isPaid) {
      return (
        <Badge
          variant="success"
          className="flex items-center gap-2 bg-green-500 text-white"
        >
          <CheckCircle className="h-4 w-4" /> Paid
        </Badge>
      );
    }

    if (
      auction.status === "ended" &&
      auction.winner?._id === session?.user?.id
    ) {
      return (
        <Badge
          variant="destructive"
          className="flex items-center gap-2 bg-blue-500 text-white"
        >
          <Clock className="h-4 w-4" /> Payment Pending
        </Badge>
      );
    }

    if (
      auction.winner?._id !== session?.user?.id &&
      auction.status === "ended"
    ) {
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-2 text-blue-500"
        >
          <XCircle className="h-4 w-4" /> Not Won
        </Badge>
      );
    }

    return null;
  };

  // Skeleton loader while fetching data
  if (loading) {
    return <MyAuctionsSkeleton />;
  }

  // Empty state when no auctions
  if (!auctions || auctions.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center">
        <Card className="shadow-xl border-blue-500 border-2 p-8 ">
          <CardContent className="flex flex-col items-center">
            <TimerReset className="h-16 w-16 text-blue-500 mb-4" />
            <p className="mb-4 text-lg ">
              You have not participated in any auctions yet.
            </p>
            <Link href="/auctions">
              <Button className="bg-blue-500 hover:bg-blue-600 transition-colors">
                Browse Auctions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render auctions
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">My Auctions</h1>
      <div className="space-y-6">
        {auctions.map((auction) => (
          <Card
            key={auction._id}
            className="cursor-pointer shadow-lg border-blue-100 border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-300"
          >
            <CardHeader className="flex flex-row items-center justify-between bg-blue-300/20 p-4">
              <CardTitle className="text-blue-600">
                {auction.product.name}
              </CardTitle>
              {renderAuctionStatusBadge(auction)}
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center space-x-4">
                {/* Product Image */}
                <div className="relative w-24 h-24">
                  <Image
                    src={`/Products/${auction.product.images[0]}`}
                    alt={auction.product.name}
                    fill
                    className="object-cover rounded-md"
                    unoptimized
                  />
                </div>

                <div className="flex-grow">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Current Price
                      </p>
                      <p className="font-bold text-lg text-blue-900">
                        ${auction.currentPrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        End Date
                      </p>
                      <p className="text-blue-800">
                        {new Date(auction.endDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                {/* Auction Details Link */}
                <a
                  href={`/auctions/${auction._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                  View Auction Details
                  <ExternalLink className="h-4 w-4" />
                </a>

                {/* Payment Timer for Won Auctions */}
                {auction.status === "ended" &&
                  auction.winner?._id === session?.user?.id &&
                  !auction.isPaid && (
                    <Link href={`/auctions-checkout?auctionId=${auction._id}`}>
                      <Button className="bg-blue-500 hover:bg-blue-600 transition-colors">
                        Proceed to Payment
                      </Button>
                    </Link>
                  )}
              </div>

              {/* Payment Timer for Won Auctions */}
              {auction.status === "ended" &&
                auction.winner?._id === session?.user?.id &&
                !auction.isPaid && (
                  <div className="mt-4 space-y-4">
                    {paymentTimers[auction._id] ? (
                      <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                        <p className="text-blue-700 font-medium flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Time left to pay:{" "}
                          {Math.floor(paymentTimers[auction._id] / 60)}:
                          {(paymentTimers[auction._id] % 60)
                            .toString()
                            .padStart(2, "0")}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Skeleton loader component
const MyAuctionsSkeleton = () => (
  <div className="container mx-auto p-4 max-w-3xl">
    <div className="h-8 w-32 mb-6">
      <Skeleton className="h-full w-full bg-gray-200" />
    </div>
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="shadow-md border-gray-100 border">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-8 w-40 bg-gray-200" />
            <Skeleton className="h-6 w-20 bg-gray-200" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Skeleton className="w-24 h-24 bg-gray-200" />
              <div className="grid grid-cols-2 gap-4 flex-grow">
                <div>
                  <Skeleton className="h-5 w-24 mb-2 bg-gray-200" />
                  <Skeleton className="h-6 w-32 bg-gray-200" />
                </div>
                <div>
                  <Skeleton className="h-5 w-24 mb-2 bg-gray-200" />
                  <Skeleton className="h-6 w-48 bg-gray-200" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);
