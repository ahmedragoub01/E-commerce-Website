"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, CreditCard, Wallet } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { loadStripe } from "@stripe/stripe-js";

// Stripe initialization with environment variable
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Auction checkout form schema
const auctionCheckoutSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["stripe", "cash"]),
});

// Auction details interface
interface AuctionDetails {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
  };
  currentPrice: number;
  productName: string;
}

export default function AuctionCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [auction, setAuction] = useState<AuctionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof auctionCheckoutSchema>>({
    resolver: zodResolver(auctionCheckoutSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      notes: "",
      paymentMethod: "stripe",
    },
  });

  // Fetch auction details
  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        // Skip if session is still loading
        if (status === "loading") return;

        // Redirect if not logged in
        if (!session?.user?.id) {
          router.push("/login");
          return;
        }

        // Get auction ID from search params
        const auctionId = searchParams.get("auctionId");
        if (!auctionId) {
          toast.error("No auction ID provided");
          router.push("/myauctions");
          return;
        }

        // Fetch auction details
        const response = await fetch(`/api/auctions/${auctionId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch auction details"
          );
        }

        const auctionData = await response.json();

        // Validate auction data
        if (!auctionData.auction) {
          throw new Error("Invalid auction data");
        }

        // Check auction winner
        if (auctionData.auction.winner !== session.user.id) {
          toast.error("You are not authorized to pay for this auction");
          router.push("/myauctions");
          return;
        }

        // Check if already paid
        if (auctionData.isPaid) {
          toast.error("This auction has already been paid");
          router.push("/auctions");
          return;
        }

        setAuction(auctionData.auction);
        setLoading(false);
      } catch (err) {
        console.error("Auction fetch error:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to load auction details"
        );
        router.push("/auctions");
      }
    };

    fetchAuctionDetails();
  }, [session, status, searchParams, router]);

  // Auction checkout handler
  const handleAuctionCheckout = async (
    values: z.infer<typeof auctionCheckoutSchema>
  ) => {
    if (!session?.user?.id || !auction) {
      toast.error("Invalid auction data");
      return;
    }

    setProcessing(true);

    try {
      const orderData = {
        userId: session.user.id,
        auctionId: auction._id,
        productId: auction.product._id,
        total: auction.currentPrice,
        shippingAddress: {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
        },
        notes: values.notes || "",
        paymentMethod: values.paymentMethod,
      };

      if (values.paymentMethod === "stripe") {
        // Create Stripe checkout session
        const response = await fetch("/api/create-auction-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to create Stripe checkout session"
          );
        }

        const { sessionId } = await response.json();

        // Stripe redirect
        const stripe = await stripePromise;
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId });
          if (error) {
            throw new Error(
              error.message || "Stripe checkout redirection failed"
            );
          }
        }
      } else {
        // Cash payment method
        const orderResponse = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...orderData,
            status: "pending",
          }),
        });

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(
            errorData.message || "Failed to create auction order"
          );
        }

        // Update auction payment status
        const auctionUpdateResponse = await fetch(
          `/api/auctions/${auction._id}/pay`,
          { method: "PUT" }
        );

        if (!auctionUpdateResponse.ok) {
          const errorData = await auctionUpdateResponse.json();
          throw new Error(
            errorData.message || "Failed to update auction payment status"
          );
        }

        toast.success("Order placed successfully!");
        router.push(`/auctions/${auction._id}?success=true`);
      }
    } catch (err) {
      console.error("Checkout process error:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Checkout failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  // Handle Stripe success/cancel returns
  useEffect(() => {
    const handleStripeReturn = async () => {
      const success = searchParams.get("success");
      const canceled = searchParams.get("canceled");
      const auctionId = searchParams.get("auctionId");

      if (success === "true" && auctionId) {
        try {
          const auctionUpdateResponse = await fetch(
            `/api/auctions/${auctionId}/pay`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ auctionId: auctionId }),
            }
          );

          if (!auctionUpdateResponse.ok) {
            const errorData = await auctionUpdateResponse.json();
            throw new Error(
              errorData.message || "Failed to update auction payment status"
            );
          }

          toast.success("Payment successful! Auction paid.");
          router.push(`/auctions/${auctionId}?success=true`);
        } catch (error) {
          console.error("Finalization error:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "Error finalizing auction payment. Please contact support."
          );
        }
      } else if (canceled === "true" && auctionId) {
        toast.error("Payment was canceled.");
        router.push(`/auctions/${auctionId}`);
      }
    };

    handleStripeReturn();
  }, [searchParams, router]);

  // Skeleton loader for initial loading state
  if (status === "loading" || loading) {
    return <AuctionCheckoutSkeleton />;
  }

  // No auction found
  if (!auction) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center">
        <Card className="shadow-md p-8">
          <CardContent>
            <p className="mb-4">No auction found</p>
            <Button onClick={() => router.push("/auctions")}>
              Browse Auctions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main checkout form render
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 flex items-center gap-1 hover:text-indigo-600 transition-all duration-100"
        onClick={() => router.push(`/auctions/${auction._id}`)}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Auction
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Order Summary */}
        <Card className="md:col-span-2 shadow-md h-fit">
          <CardHeader>
            <CardTitle>Auction Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Product</span>
              <span>{auction.product.name || "Auction Product"}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>Winning Bid</span>
              <span>${auction.currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>$5.00</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${(auction.currentPrice + 5).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form */}
        <Card className="md:col-span-3 shadow-md">
          <CardHeader>
            <CardTitle>Shipping & Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAuctionCheckout)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Zip Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Delivery Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional instructions for delivery"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-6" />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="stripe" id="stripe" />
                            <Label
                              htmlFor="stripe"
                              className="flex items-center gap-2"
                            >
                              <CreditCard className="h-4 w-4" />
                              Pay with Card
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cash" id="cash" />
                            <Label
                              htmlFor="cash"
                              className="flex items-center gap-2"
                            >
                              <Wallet className="h-4 w-4" />
                              Pay on Delivery
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={processing}
                >
                  {processing
                    ? "Processing..."
                    : form.watch("paymentMethod") === "stripe"
                    ? "Proceed to Payment"
                    : "Complete Order"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton Loader Component
const AuctionCheckoutSkeleton = () => (
  <div className="container mx-auto p-4 max-w-3xl">
    <div className="h-6 w-24 mb-6">
      <Skeleton className="h-full w-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Separator />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-3">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={i > 3 ? "md:col-span-2" : ""}>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <Skeleton className="h-5 w-32 mb-2" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-12 w-full mt-6" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
