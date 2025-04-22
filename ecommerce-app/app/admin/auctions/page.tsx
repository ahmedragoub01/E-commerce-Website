"use client";
import {Table,TableBody,TableCaption,TableCell,TableFooter,TableHead,TableHeader,TableRow} from "@/components/ui/table"
import {useEffect,useState} from "react"
import {Button} from "@/components/ui/button"
import {Edit,Plus,Trash2} from "lucide-react"
import Link from "next/link"
import {useRouter} from "next/navigation"
import { ToggleButton } from "@mui/material";

export default function AuctionsPage() {
  const router = useRouter()
  const [auctions, setAuctions] = useState([])
  const [filteredAuctions, setFilteredAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(true) // Toggle state

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch("/api/auctions")
        if (!response.ok) {
          throw new Error("Failed to fetch auctions")
        }
        const data = await response.json()
        setAuctions(data)
        setFilteredAuctions(data) // Initialize filtered auctions with all data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAuctions()
  }, [])
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this auction?")) {
      return;
    }

    try {
      const response = await fetch(`/api/auctions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete auction");
      }

      setAuctions((prevAuctions) => prevAuctions.filter((auction) => auction._id !== id));
      setFilteredAuctions((prevFiltered) => prevFiltered.filter((auction) => auction._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  // Filter auctions based on the toggle state
  useEffect(() => {
    if (showAll) {
      setFilteredAuctions(auctions)
    } else {
      const activeAuctions = auctions.filter(auction => 
        auction.status === 'active' || auction.status === 'available'
      )
      setFilteredAuctions(activeAuctions)
    }
  }, [showAll, auctions])

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Auctions</h1>
        <div className="flex items-center space-x-4">
          <ToggleButton
            value={showAll}
            selected={showAll}
            onChange={() => setShowAll((prev) => !prev)}
            sx={{
                px:2,
                mr:4,
            }}
          >
            {showAll ? "All Auctions" : "Active Only"}
          </ToggleButton>
          <Link href="/admin/auctions/new">
            <Button>
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
          <TableCaption>A list of {showAll ? "all" : "active"} auctions</TableCaption>
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
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(auction._id)}>
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}