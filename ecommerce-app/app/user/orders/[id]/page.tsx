"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  CheckCircle,
  Clock,
  ShoppingCart,
  XCircle,
  Eye,
  ChevronLeft,
  MapPin,
  Truck,
} from "lucide-react";

export default function OrderDetailsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session && id) {
      fetch(`/api/orders/${id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch order");
          }
          return res.json();
        })
        .then((data) => {
          setOrder(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching order details:", error);
          setLoading(false);
        });
    }
  }, [session, id]);

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
      case "pending":
        return <Clock className="text-yellow-500 w-5 h-5" />;
      default:
        return <ShoppingCart className="text-gray-500 w-5 h-5" />;
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-50";
      case "processing":
        return "bg-amber-50";
      case "shipped":
        return "bg-blue-50";
      case "cancelled":
        return "bg-red-50";
      case "pending":
        return "bg-yellow-50";
      default:
        return "bg-gray-50";
    }
  };

  const calculateDeliveryDateRange = (orderDate) => {
    if (!orderDate) return { earliestDate: null, latestDate: null };

    const orderDateTime = new Date(orderDate);

    // Calculate earliest delivery (order date + 2 days)
    const earliestDate = new Date(orderDateTime);
    earliestDate.setDate(earliestDate.getDate() + 2);

    // Calculate latest delivery (order date + 4 days)
    const latestDate = new Date(orderDateTime);
    latestDate.setDate(latestDate.getDate() + 4);

    return { earliestDate, latestDate };
  };

  const formatDeliveryDateRange = (orderDate) => {
    if (!orderDate) return "Not available";

    const { earliestDate, latestDate } = calculateDeliveryDateRange(orderDate);

    if (!earliestDate || !latestDate) return "Not available";

    const options = { month: "short", day: "numeric" };

    // If both dates are in the same month
    if (earliestDate.getMonth() === latestDate.getMonth()) {
      return `${earliestDate.toLocaleDateString(
        "en-US",
        options
      )} - ${latestDate.getDate()}`;
    } else {
      return `${earliestDate.toLocaleDateString(
        "en-US",
        options
      )} - ${latestDate.toLocaleDateString("en-US", options)}`;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-6 max-w-4xl">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer mb-6 flex items-center gap-1 hover:text-indigo-600 transition-all duration-100 transform hover:scale-[1.05]"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-6  text-gray-800">
          Order Details
        </h1>
        <div className="space-y-4">
          <Skeleton className="w-full h-16 rounded-xl" />
          <Skeleton className="w-full h-32 rounded-xl" />
          <Skeleton className="w-full h-64 rounded-xl" />
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
          className="cursor-pointer mb-6 flex items-center gap-1 hover:text-indigo-600 transition-all duration-100 transform hover:scale-[1.05]"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-6  text-gray-800">
          Order Details
        </h1>
        <Card className="p-8 shadow-lg border rounded-2xl bg-white">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Package className="h-16 w-16 text-gray-300" />
            </div>
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
        className="cursor-pointer mb-6 flex items-center gap-1 hover:text-indigo-600 transition-all duration-100 transform hover:scale-[1.05]"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Order Details</h1>
      <Card className="p-8 shadow-lg border rounded-2xl bg-white overflow-hidden ">
        <div className="space-y-6">
          {/* Order Header */}
          <div className="flex justify-center items-center gap-42 ">
            <div>
              <p className="text-sm text-gray-500 uppercase">Order ID</p>
              <p className="text-lg font-semibold text-gray-800">{order._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Date</p>
              <p className="text-lg font-semibold text-gray-800">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Total</p>
              <p className="text-lg font-semibold text-blue-600">
                ${order.total}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`flex items-center rounded-lg p-4 ${getStatusBackgroundColor(
              order.status
            )}`}
          >
            <div className="mr-3">{getStatusIcon(order.status)}</div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Status</p>
              <p className="text-md font-medium text-gray-800">
                {order.status}
              </p>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Shipping Address */}
            <Card className="p-4 border border-gray-100 rounded-xl">
              <div className="flex items-start gap-3">
                <MapPin className="text-indigo-600 w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-2">
                    Shipping Address
                  </h3>
                  {order.shippingAddress ? (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.zipCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No shipping address available
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Expected Delivery */}
            <Card className="p-4 border border-gray-100 rounded-xl">
              <div className="flex items-start gap-3">
                <Truck className="text-indigo-600 w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-2">
                    Expected Delivery
                  </h3>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">
                      {formatDeliveryDateRange(order.createdAt)}
                    </p>
                    {order.status?.toLowerCase() === "shipped" && (
                      <p className="text-xs mt-2 text-green-600">
                        Your package is on its way!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Separator className="my-2" />

          {/* Items Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              Order Items
            </h2>

            <div className="grid gap-4">
              {order.items &&
                order.items.map((item) => (
                  <Card
                    key={item.id}
                    className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-20 h-20 relative overflow-hidden rounded-lg border border-gray-100">
                        {item.product.images &&
                        item.product.images.length > 0 ? (
                          <Image
                            src={`/Products/${item.product.images[0]}`}
                            alt={item.product.name || "Product image"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">
                              No image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="text-lg font-medium text-gray-800">
                          {item.product.name || "Unnamed product"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                            Qty: {item.quantity}
                          </span>
                          {item.product.sku && (
                            <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                              SKU: {item.product.sku}
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() =>
                            router.push(`/product/${item.product._id}`)
                          }
                          className="mt-2 bg-indigo-600 hover:bg-blue-600 text-white text-xs px-3 py-1 h-8  flex items-center gap-1"
                          size="sm"
                        >
                          <Eye className="h-3 w-3" />
                          See Product
                        </Button>
                      </div>
                      <div className="flex-shrink-0">
                        <p className="text-lg font-semibold text-blue-600">
                          ${item.price}
                        </p>
                        <p className="text-sm text-gray-500 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-xl mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                ${order.subtotal || (order.total * 0.9).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">${order.shipping || "5.00"}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">
                ${order.tax || (order.total * 0.1).toFixed(2)}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold text-lg">
              <span className="text-gray-800">Total</span>
              <span className="text-blue-600">${order.total}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
