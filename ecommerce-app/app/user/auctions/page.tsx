"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Clock,
  Gavel,
  Calendar,
  Zap,
  Search,
  Tag,
  ArrowUpDown,
  TimerOff,
  ShoppingBag,
  Hammer,
} from "lucide-react";

// Countdown Timer component that updates every second
const CountdownTimer = ({ targetDate, type, auctionId }) => {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  // Function to update auction status via API
  const updateAuctionStatus = async () => {
    try {
      const response = await fetch(`/api/auctions/${auctionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: type === "start" ? "active" : "ended",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update auction status");
      }
    } catch (error) {
      console.error("Error updating auction status:", error);
    }
  };

  useEffect(() => {
    // Calculate time remaining function
    const calculateTimeRemaining = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        // If not already marked as complete, update status
        if (!isComplete) {
          setIsComplete(true);
          updateAuctionStatus(); // Call API to update status

          if (type === "start") {
            setTimeRemaining("Started");
          } else {
            setTimeRemaining("Ended");
          }
        }
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      let timeText = type === "start" ? "Starts in " : "Ends in ";

      if (days > 0) {
        setTimeRemaining(
          `${timeText}${days}d ${hours}h ${minutes}m ${seconds}s`
        );
      } else if (hours > 0) {
        setTimeRemaining(`${timeText}${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${timeText}${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${timeText}${seconds}s`);
      }
    };

    // Calculate initially
    calculateTimeRemaining();

    // Set up interval to update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [targetDate, type, auctionId, isComplete]);

  // Get appropriate color classes based on type and status
  const getColorClasses = () => {
    if (isComplete) {
      if (type === "start") {
        return "bg-green-500/20 text-green-500"; // Started
      } else {
        return "bg-red-500/20 text-red-500"; // Ended
      }
    } else {
      if (type === "start") {
        return "bg-yellow-500/20 text-yellow-500"; // Upcoming
      } else {
        return "bg-green-500/20 text-green-500"; // Active
      }
    }
  };

  return (
    <div
      className={`flex items-center text-sm ${getColorClasses()} p-2 rounded`}
    >
      <Clock className="h-4 w-4 mr-1" />
      <span className="font-medium">{timeRemaining}</span>
    </div>
  );
};

// Component for displaying ended auction info
const EndedAuctionInfo = ({ endDate }) => {
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <div className="flex items-center text-sm bg-red-500/20 text-red-500 p-2 rounded">
      <TimerOff className="h-4 w-4 mr-1" />
      <span>Ended on {formatDate(endDate)}</span>
    </div>
  );
};

// Helper function to fetch auctions from your backend GET endpoint.
const fetchAuctions = async (status?: string, search?: string) => {
  try {
    let url = "/api/auctions";
    const params = new URLSearchParams();

    if (status && status !== "all") params.append("status", status);
    if (search) params.append("search", search);

    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch auctions");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("endingSoon");
  const [isLoading, setIsLoading] = useState(true);

  // Function to load auctions with all filters
  const loadAuctions = async () => {
    setIsLoading(true);
    const data = await fetchAuctions(status, search);

    // Sort the auctions based on the selected sort option
    const sortedData = [...data].sort((a, b) => {
      switch (sortBy) {
        case "endingSoon":
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case "priceLowHigh":
          return a.currentPrice - b.currentPrice;
        case "priceHighLow":
          return b.currentPrice - a.currentPrice;
        default:
          return 0;
      }
    });

    setAuctions(sortedData);
    setIsLoading(false);
  };

  // Fetch auctions when the component mounts or when filters change
  useEffect(() => {
    loadAuctions();
  }, [status, sortBy]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    loadAuctions();
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-500/20 text-green-800 flex items-center gap-1">
            <Zap className="h-3 w-3" /> Active
          </Badge>
        );
      case "upcoming":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Upcoming
          </Badge>
        );
      case "ended":
        return (
          <Badge className="bg-red-500/20 text-red-800 flex items-center gap-1">
            <TimerOff className="h-3 w-3" /> Ended
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Live Auctions</h1>
          <p className="text-gray-500">Discover and bid on unique items</p>
        </div>
        <div className="flex gap-4">
          <Link href="/home">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <Link href="/myauctions">
            <Button className="border-2 border-blue-500 bg-transparent text-blue-500 hover:bg-blue-500/20 hover:text-blue-700">
              <Hammer className="h-4 w-4 mr-2" />
              My Auctions
            </Button>
          </Link>
        </div>
      </div>

      {/* Rest of the existing code remains the same */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={status === "all" ? "default" : "outline"}
            onClick={() => setStatus("all")}
            className={status === "all" ? "bg-blue-500 hover:bg-blue-600" : ""}
          >
            All
          </Button>
          <Button
            variant={status === "active" ? "default" : "outline"}
            onClick={() => setStatus("active")}
            className={
              status === "active" ? "bg-green-600 hover:bg-green-700" : ""
            }
          >
            <Zap className="h-4 w-4 mr-1" /> Active
          </Button>
          <Button
            variant={status === "upcoming" ? "default" : "outline"}
            onClick={() => setStatus("upcoming")}
            className={
              status === "upcoming" ? "bg-yellow-600 hover:bg-yellow-700" : ""
            }
          >
            <Calendar className="h-4 w-4 mr-1" /> Upcoming
          </Button>
          <Button
            variant={status === "ended" ? "default" : "outline"}
            onClick={() => setStatus("ended")}
            className={status === "ended" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            <TimerOff className="h-4 w-4 mr-1" /> Ended
          </Button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search auctions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Search
            </Button>
          </form>

          <div className="flex gap-2 items-center">
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="endingSoon">Ending Soon</SelectItem>
                <SelectItem value="priceLowHigh">Price: Low to High</SelectItem>
                <SelectItem value="priceHighLow">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Auctions Grid */}
        <div className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : auctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <Link
                  href={`/auctions/${auction._id}`}
                  key={auction._id}
                  className="group"
                >
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group-hover:border-indigo-200">
                    <div className="cursor-pointer h-64 w-64 overflow-hidden relative mx-auto">
                      {auction.product.images ? (
                        <Image
                          src={`/Products/${auction.product.images[0]}`}
                          alt={auction.product.name}
                          layout="fill"
                          objectFit="cover"
                          className="h-full w-full transition-transform duration-700 hover:scale-110"
                          loading="lazy"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Tag className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(auction.status)}
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle
                        className="line-clamp-2 text-lg"
                        title={auction.product.name}
                      >
                        {auction.product.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">
                          Current Bid
                        </span>
                        <span className="text-xl font-bold text-blue-600">
                          {formatCurrency(auction.currentPrice)}
                        </span>
                      </div>

                      {auction.status === "active" ? (
                        <CountdownTimer
                          targetDate={auction.endDate}
                          type="end"
                          auctionId={auction._id}
                        />
                      ) : auction.status === "upcoming" ? (
                        <CountdownTimer
                          targetDate={auction.startDate}
                          type="start"
                          auctionId={auction._id}
                        />
                      ) : (
                        <EndedAuctionInfo endDate={auction.endDate} />
                      )}
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        {auction.status === "active" ? (
                          <>Place Bid</>
                        ) : auction.status === "upcoming" ? (
                          <>View Details</>
                        ) : (
                          <>See Results</>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-gray-200 rounded-lg">
              <Gavel className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">No auctions found</h3>
              <p className="text-gray-500 mb-6">
                {search
                  ? "Try adjusting your search criteria"
                  : "There are no auctions available right now"}
              </p>
              {search && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    loadAuctions();
                  }}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
