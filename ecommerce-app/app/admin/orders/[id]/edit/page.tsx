"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Order {
  _id: string;
  status: string;
}

const orderStatuses = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function EditOrderPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const orderData = await response.json();
        setOrder(orderData);
        setStatus(orderData.status);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order data");
        router.push("/admin/orders");
      }
    };

    fetchOrder();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      toast.success("Order status updated successfully");
      router.push("/admin/orders");
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-red-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Edit Order</h1>
        <Button variant="outline" onClick={() => router.push("/admin/orders")}>
          Back to Orders
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Order Status *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((statusOption) => (
                  <SelectItem
                    key={statusOption.value}
                    value={statusOption.value}
                  >
                    {statusOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/orders")}
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            type="submit"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Updating..." : "Update Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
