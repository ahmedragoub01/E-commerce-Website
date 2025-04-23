"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToggleButton } from "@mui/material";

export default function AuctionsPage() {
  const router = useRouter();
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(true); // Toggle state

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch("/api/auctions");
        if (!response.ok) {
          throw new Error("Failed to fetch auctions");
        }
        const data = await response.json();
        setAuctions(data);
        setFilteredAuctions(data); // Initialize filtered auctions with all data
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  // Filter auctions based on the toggle state
  useEffect(() => {
    if (showAll) {
      setFilteredAuctions(auctions);
    } else {
      const activeAuctions = auctions.filter(
        (auction) =>
          auction.status === "active" || auction.status === "available"
      );
      setFilteredAuctions(activeAuctions);
    }
  }, [showAll, auctions]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Auctions</h1>
        <div className="flex items-center space-x-4">
          <ToggleButton
            className="bg-gray-200 text-blue-800 hover:bg-gray-300"
            value={showAll}
            selected={showAll}
            onChange={() => setShowAll((prev) => !prev)}
            sx={{
              px: 2,
              mr: 4,
            }}
          >
            {showAll ? "All Auctions" : "Active Only"}
          </ToggleButton>
          <Link href="/admin/auctions/new">
            <Button className="bg-blue-500 text-white hover:bg-blue-600">
              <Plus className="mr-2" />
              Create Auction
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div>Loading auctions...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Table>
          <TableCaption>
            A list of {showAll ? "all" : "active"} auctions
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Auction ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Starting Price</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAuctions.map((auction) => (
              <TableRow key={auction._id}>
                <TableCell>{auction._id}</TableCell>
                <TableCell>{auction.product.name}</TableCell>
                <TableCell>{auction.startingPrice}</TableCell>
                <TableCell>{auction.currentPrice}</TableCell>
                <TableCell>{auction.status}</TableCell>
                <TableCell className="flex space-x-2">
                  <Link href={`/admin/auctions/${auction._id}`}>
                    <Button
                      className="text-yellow-500 hover:text-white hover:bg-yellow-500"
                      variant="outline"
                      size="icon"
                    >
                      <Edit />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="text-red-600 bg-white hover:text-white hover:bg-red-600"
                    size="icon"
                    onClick={() => handleDelete(auction._id)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
