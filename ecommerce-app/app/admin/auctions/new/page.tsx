"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateAuctionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    startingPrice: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectProduct = () => {
    // Store current form data in session storage before redirecting
    sessionStorage.setItem("auctionFormData", JSON.stringify(formData));
    router.push("/admin/auctions/select-product");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      if (
        !formData.productId ||
        !formData.startingPrice ||
        !formData.startDate ||
        !formData.endDate
      ) {
        throw new Error("All fields are required");
      }

      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        throw new Error("End date must be after start date");
      }

      const response = await fetch("/api/auctions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: formData.productId,
          startingPrice: Number(formData.startingPrice),
          currentPrice: Number(formData.startingPrice),
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create auction");
      }

      alert("Auction created successfully");
      router.push("/admin/auctions");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      alert(err instanceof Error ? err.message : "Failed to create auction");
    } finally {
      setLoading(false);
    }
  };

  // Load any previously saved form data
  useState(() => {
    const savedData = sessionStorage.getItem("auctionFormData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
      sessionStorage.removeItem("auctionFormData");
    }
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Auction</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Auctions
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Product</Label>
            <div className="flex items-center gap-2">
              {formData.productId ? (
                <>
                  <span className="text-sm font-medium">
                    {formData.productName}
                  </span>
                  <span className="text-sm text-gray-500">
                    (ID: {formData.productId})
                  </span>
                </>
              ) : (
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  type="button"
                  variant="outline"
                  onClick={handleSelectProduct}
                >
                  Select Product
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startingPrice">Starting Price ($)</Label>
            <Input
              id="startingPrice"
              name="startingPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.startingPrice}
              onChange={handleChange}
              placeholder="Enter starting price"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            type="submit"
            disabled={loading || !formData.productId}
          >
            {loading ? "Creating..." : "Create Auction"}
          </Button>
        </div>
      </form>
    </div>
  );
}
