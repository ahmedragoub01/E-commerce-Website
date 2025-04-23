"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");

  const statusOptions = [
    "all",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  useEffect(() => {
    if (session) {
      setIsLoading(true);
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          setOrders(data);
          setFilteredOrders(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching orders:", error);
          setIsLoading(false);
        });
    }
  }, [session]);

  useEffect(() => {
    // Filter orders based on search query and active status
    let results = orders;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (order) =>
          order._id.toLowerCase().includes(query) ||
          (order.items &&
            order.items.some((item) =>
              (item.product.name || "").toLowerCase().includes(query)
            ))
      );
    }

    if (activeStatus !== "all") {
      results = results.filter(
        (order) => order.status.toLowerCase() === activeStatus.toLowerCase()
      );
    }

    setFilteredOrders(results);
  }, [searchQuery, activeStatus, orders]);

  const getStatusBadgeStyle = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "shipped":
        return <ShoppingBag className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => router.push("/home")}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Continue Shopping
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search orders or items..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0">
          {statusOptions.map((status) => (
            <Button
              key={status}
              variant={activeStatus === status ? "default" : "outline"}
              className={
                activeStatus === status
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "text-primary hover:bg-gray-100"
              }
              size="sm"
              onClick={() => setActiveStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all overflow-hidden"
            >
              <div
                className="flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer"
                onClick={() => router.push(`/orders/${order._id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold">
                      Order #{order._id.slice(-6)}
                    </h3>
                    <Badge
                      className={`flex items-center gap-1 ${getStatusBadgeStyle(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)} {order.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {order.createdAt ? formatDate(order.createdAt) : "N/A"}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Items:</span>{" "}
                    {order.items ? (
                      <>
                        {order.items.slice(0, 3).map((item, idx) => (
                          <span key={idx}>
                            {item.product.name}
                            {item.quantity > 1 ? ` (x${item.quantity})` : ""}
                            {idx < Math.min(order.items.length, 3) - 1
                              ? ", "
                              : ""}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-gray-500 italic">
                            {" "}
                            and {order.items.length - 3} more items...
                          </span>
                        )}
                      </>
                    ) : (
                      "Order items not available"
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="font-bold text-lg">
                    ${order.total?.toFixed(2) || "0.00"}
                  </div>
                  <Button
                    variant="ghost"
                    className="p-2 hover:bg-indigo-50 text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/orders/${order._id}`);
                    }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <ShoppingBag className="h-16 w-16 text-gray-200" />
            <h2 className="text-2xl font-semibold">No orders found</h2>
            {searchQuery || activeStatus !== "all" ? (
              <>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveStatus("all");
                  }}
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-500 mb-4">
                  Looks like you haven't placed any orders yet.
                </p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push("/shop")}
                >
                  Start Shopping
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
