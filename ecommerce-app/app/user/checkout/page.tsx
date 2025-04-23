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

// Initialize Stripe with publishable key (not secret key)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Define form schema
const formSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["stripe", "cash"]),
});

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
}

interface Cart {
  items: CartItem[];
  total: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      notes: "",
      paymentMethod: "stripe", // Default to Stripe
    },
  });

  // Check if we're buying a single product or the whole cart
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    const productId = searchParams.get("productId");

    if (productId) {
      // Load single product from localStorage
      const singleItem = localStorage.getItem("checkoutItem");
      if (singleItem) {
        try {
          setCart(JSON.parse(singleItem));
          setLoading(false);
        } catch (err) {
          console.error("Failed to parse single item", err);
          router.push("/cart");
        }
      } else {
        router.push("/cart");
      }
    } else {
      // Load full cart
      const cartData = localStorage.getItem("cart");
      if (cartData) {
        try {
          setCart(JSON.parse(cartData));
          setLoading(false);
        } catch (err) {
          console.error("Failed to parse cart", err);
          router.push("/cart");
        }
      } else {
        fetchCart();
      }
    }
  }, [session, status, searchParams, router]);

  // Fetch cart from API
  const fetchCart = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const cartData = await response.json();
      setCart(cartData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cart data");
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (values: z.infer<typeof formSchema>) => {
    if (!session?.user?.id || !cart || cart.items.length === 0) {
      toast.error("Invalid cart data");
      return;
    }

    setProcessing(true);

    try {
      // Common order data
      const orderData = {
        userId: session.user.id,
        cartId: cart._id,
        total: cart.total,
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
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          throw new Error("Failed to create Stripe checkout session");
        }

        const { orderId, sessionId } = await response.json();

        // Store orderId in localStorage for post-payment processing
        localStorage.setItem("pendingOrderId", orderId);
        localStorage.setItem(
          "checkoutShippingAddress",
          JSON.stringify({
            street: values.street,
            city: values.city,
            state: values.state,
            zipCode: values.zipCode,
            country: values.country,
          })
        );
        // Redirect to Stripe Checkout
        const stripe = await stripePromise;
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId });
          if (error) throw new Error(error.message);
        }
      } else {
        // Handle cash payment (Pay on Delivery)
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...orderData,
            status: "pending",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create order");
        }

        const { orderId } = await response.json();

        // Clear cart after successful order
        localStorage.removeItem("cart");
        localStorage.removeItem("checkoutItem");

        toast.success("Order placed successfully!");

        // Redirect to order confirmation page
        router.push(`/orders/${orderId}?success=true`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Handle Stripe success/cancel returns
  // In checkout page.tsx, modify this section:
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const orderId = localStorage.getItem("pendingOrderId");
    const auctionId = searchParams.get("auctionId");

    if (success === "true" && orderId) {
      const finalizeOrder = async () => {
        try {
          // Get the cart data
          const cartData =
            localStorage.getItem("cart") ||
            localStorage.getItem("checkoutItem");
          if (!cartData) return;

          const cart = JSON.parse(cartData);

          // Get shipping address from localStorage
          const shippingAddressData = localStorage.getItem(
            "checkoutShippingAddress"
          );
          const shippingAddress = shippingAddressData
            ? JSON.parse(shippingAddressData)
            : {};

          // Create the order in your database
          const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: session?.user.id,
              cartId: cart._id,
              shippingAddress: shippingAddress,
              paymentIntentId: orderId,
              auctionId: auctionId, // Pass the auctionId
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to create order");
          }

          // If this is an auction payment, update the auction
          if (auctionId) {
            const auctionUpdateResponse = await fetch(
              `/api/auctions/${auctionId}/pay`,
              {
                method: "PUT",
              }
            );

            if (!auctionUpdateResponse.ok) {
              throw new Error("Failed to update auction payment status");
            }
          }

          // Clear temporary data
          localStorage.removeItem("cart");
          localStorage.removeItem("checkoutItem");
          localStorage.removeItem("pendingOrderId");
          localStorage.removeItem("checkoutShippingAddress");

          toast.success("Payment successful! Your order has been placed.");
          router.push(
            auctionId
              ? `/auctions/${auctionId}?success=true`
              : `/orders/${orderId}?success=true`
          );
        } catch (error) {
          console.error(error);
          toast.error("Error finalizing your order. Please contact support.");
        }
      };

      finalizeOrder();
    } else if (canceled === "true") {
      toast.error("Payment was canceled. Your cart is still available.");
      router.push("/cart");
    }
  }, [searchParams, router, session]);

  if (status === "loading" || loading) {
    return <CheckoutSkeleton />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center">
        <Card className="shadow-md p-8">
          <CardContent>
            <p className="mb-4">Your cart is empty</p>
            <Button onClick={() => router.push("/products")}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        className=" mb-6 flex items-center gap-1 hover:text-blue-600 transition-all duration-100"
        onClick={() => router.push("/cart")}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to cart
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Order Summary */}
        <Card className="md:col-span-2 shadow-md h-fit">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {cart.items.map((item) => (
                <li key={item.product._id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      ${item.product.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
            <Separator />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>$5.00</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${(cart.total + 5).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form */}
        <Card className="md:col-span-3 shadow-md">
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleCheckout)}
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
                            <RadioGroupItem
                            
                             value="stripe" id="stripe" />
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
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
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

// Skeleton Loader
const CheckoutSkeleton = () => (
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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
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
