"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  CheckCircle,
  Clock,
  ShoppingCart,
  XCircle,
  ChevronLeft,
  Printer,
} from "lucide-react";

export default function OrderDetailsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder(); // Remove session dependency
  }, [id]);

  const generateInvoice = async () => {
    if (!order) return;

    try {
      // Format the order data for the invoice API
      const invoiceData = {
        from: "Your Company Name",
        to: order.user?.name || "Customer",
        number: order._id,
        date: new Date(order.createdAt).toLocaleDateString(),
        due_date: new Date(order.createdAt).toLocaleDateString(),
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          unit_cost: item.price,
        })),
        fields: {
          tax: "%",
          discounts: false,
          shipping: true,
        },
        tax: order.tax || (order.total * 0.1).toFixed(2),
        shipping: order.shipping || 5.0,
        amount_paid: 0,
        notes: "Thank you for your business!",
        terms: "Terms: Payment due within 15 days",
      };

      // Convert to URL-encoded form data

      // Make the API request
      const response = await fetch("/api/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) throw new Error("Failed to generate invoice");

      // Create a download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order._id}.pdf`;
      document.body.appendChild(a);
      a.click();
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    }
  };

  const handlePrint = () => {
    generateInvoice();
  };
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="text-green-500 w-5 h-5" />;
      case "processing":
        return <Clock className="text-amber-500 w-5 h-5" />;
      case "shipped":
        return <Package className="text-blue-500 w-5 h-5" />;
      case "cancelled":
        return <XCircle className="text-red-500 w-5 h-5" />;
      default:
        return <ShoppingCart className="text-gray-500 w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-6 max-w-4xl">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer mb-6 flex items-center gap-1 hover:text-blue-600 transition-all duration-100 transform hover:scale-[1.05]"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Order Details</h1>
        <div className="space-y-4">
          <div className="w-full h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-10 px-6 max-w-4xl">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer mb-6 flex items-center gap-1 hover:text-blue-600 transition-all duration-100 transform hover:scale-[1.05]"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Order Details</h1>
        <Card className="p-8 shadow-lg border rounded-2xl bg-white">
          <div className="text-center space-y-4">
            <Package className="h-16 w-16 text-gray-300" />
            <p className="text-xl text-gray-500">Order not found</p>
            <p className="text-gray-400">
              The order you are looking for doesn't exist or has been removed.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-6 max-w-4xl">
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer mb-6 flex items-center gap-1 hover:text-blue-600 transition-all duration-100 transform hover:scale-[1.05]"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Order Details</h1>
      <Card className="p-8 shadow-lg border rounded-2xl bg-white overflow-hidden">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 uppercase">Order ID</p>
              <p className="text-lg font-semibold text-gray-800">{order._id}</p>
            </div>
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-600 text-white text-sm px-4 py-2 flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Bill
            </Button>
          </div>
          <Separator className="my-4" />
          <div>
            <p className="text-sm text-gray-500 uppercase">Status</p>
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <p className="text-lg font-medium text-gray-600">
                {order.status}
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <div>
            <h2 className="text-xl font-semibold text-gray-600">Order Items</h2>
            <div className="space-y-4 mt-4">
              {order.items.map((item) => (
                <Card key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 relative overflow-hidden rounded-lg border">
                      <Image
                        src={`/Products/${item.product.images[0]}`}
                        alt={item.product.name || "Product image"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="text-lg font-medium text-gray-600">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-blue-600">
                      ${item.price}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <Separator className="my-4" />
          <div>
            <h2 className="text-xl font-semibold text-gray-600">
              Order Summary
            </h2>
            <div className="mt-4">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal</p>
                <p className="text-gray-600">${order.total * 0.9}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Shipping</p>
                <p className="text-gray-600">${order.shipping || "5.00"}</p>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  ${order.tax || (order.total * 0.1).toFixed(2)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <p className="text-gray-600">Total</p>
                <p className="text-blue-600">${order.total}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
