"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Minus, Plus, Trash2, CreditCard } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    inventory: number;
  };
  quantity: number;
}

interface Cart {
  items: CartItem[];
  total: number;
}

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Fetch cart from API when session is loaded
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.id) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [session, status]);

  // Helper function to fetch cart
  const fetchCart = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/cart?userId=${session.user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const cartData = await response.json();
      setCart(cartData);

      // Store cart in localStorage
      localStorage.setItem("cart", JSON.stringify(cartData));
    } catch (err) {
      setError("Failed to load your cart. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update quantity using localStorage
  const updateQuantity = (
    productId: string,
    newQuantity: number,
    inventory: number
  ) => {
    if (!cart) return;

    // Check for removal
    if (newQuantity < 1) {
      setConfirmDelete(productId);
      return;
    }

    // Check if new quantity exceeds inventory
    if (newQuantity > inventory) {
      toast.error("Cannot add more than available inventory!");
      return;
    }

    try {
      // Update cart in state
      const updatedItems = cart.items.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      const newTotal = updatedItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const updatedCart = { ...cart, items: updatedItems, total: newTotal };

      // Update state
      setCart(updatedCart);

      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      toast.success("Quantity updated!");
    } catch (err) {
      setError("Failed to update cart. Please try again.");
      console.error(err);
      // Refetch cart to get correct state
      fetchCart();
    }
  };

  // Remove an item from the cart via API
  const removeItem = async (productId: string) => {
    if (!cart || !session?.user?.id) return;

    try {
      // Optimistically update UI
      const updatedItems = cart.items.filter(
        (item) => item.product._id !== productId
      );
      const newTotal = updatedItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      setCart({ ...cart, items: updatedItems, total: newTotal });

      // Send delete request to API
      const response = await fetch("/api/cart/remove-item", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          productId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      // Update cart with response data
      const updatedCart = await response.json();
      setCart(updatedCart);

      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      toast.success("Item removed!");
      setConfirmDelete(null);
    } catch (err) {
      // Revert optimistic update on error
      setError("Failed to remove item. Please try again.");
      console.error(err);
      // Refetch cart to get correct state
      fetchCart();
    }
  };

  // Purchase individual product
  const purchaseProduct = (productId: string) => {
    if (!cart) return;

    // Find the product in the cart
    const productItem = cart.items.find(
      (item) => item.product._id === productId
    );

    if (!productItem) {
      toast.error("Product not found in cart");
      return;
    }

    // Create a single-item cart for checkout
    const singleItemCart = {
      items: [productItem],
      total: productItem.product.price * productItem.quantity,
    };

    // Store the single item cart in localStorage for the checkout page
    localStorage.setItem("checkoutItem", JSON.stringify(singleItemCart));

    // Navigate to checkout with product ID
    router.push(`/checkout?productId=${productId}`);
  };

  if (status === "loading" || loading) {
    return <CartSkeleton />;
  }

  if (error) return <p className="text-red-500 text-center">{error}</p>;

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center">
        <Card className="shadow-md p-8">
          <CardContent>
            <p className="mb-4">Please login to view your cart</p>
            <Button onClick={() => router.push("/login")}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        className="cursor-pointer mb-6 flex items-center gap-1 hover:text-indigo-600 transition-all duration-100"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to shopping
      </Button>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Your Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {cart && cart.items.length > 0 ? (
            <>
              <ScrollArea className="h-[calc(110vh-350px)] pr-4">
                <ul className="space-y-4">
                  {cart.items.map((item) => (
                    <li key={item.product._id}>
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 overflow-hidden rounded-md bg-gray-100">
                          <Image
                            src={`/Products/${item.product.images[0]}`}
                            alt={item.product.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                            priority={false}
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ${item.product.price.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {/* Minus Button */}
                            <Button
                              onClick={() =>
                                updateQuantity(
                                  item.product._id,
                                  item.quantity - 1,
                                  item.product.inventory
                                )
                              }
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            {/* Input Field */}
                            <Input
                              type="number"
                              min="1"
                              max={item.product.inventory}
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(
                                  e.target.value,
                                  10
                                );
                                if (isNaN(newQuantity)) return;
                                updateQuantity(
                                  item.product._id,
                                  newQuantity,
                                  item.product.inventory
                                );
                              }}
                              className="w-16 border rounded p-1 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              inputMode="numeric"
                            />

                            {/* Plus Button */}
                            <Button
                              onClick={() =>
                                updateQuantity(
                                  item.product._id,
                                  item.quantity + 1,
                                  item.product.inventory
                                )
                              }
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                          <div className="flex flex-col gap-2 mt-2">
                            <Button
                              onClick={() => purchaseProduct(item.product._id)}
                              variant="outline"
                              size="sm"
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                            >
                              <CreditCard className="h-3 w-3" />
                              Buy now
                            </Button>
                            <Button
                              onClick={() => setConfirmDelete(item.product._id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </li>
                  ))}
                </ul>
              </ScrollArea>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => router.push("/checkout")}
                    className="bg-blue-500 hover:bg-blue-600"
                    size="lg"
                  >
                    Checkout All Items
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyCart />
          )}
        </CardContent>
      </Card>
      <RemoveItemDialog
        open={confirmDelete !== null}
        onOpenChange={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && removeItem(confirmDelete)}
      />
    </div>
  );
}

// Skeleton Loader
const CartSkeleton = () => (
  <div className="container mx-auto p-4 max-w-3xl">
    <div className="h-6 w-24 mb-6">
      <Skeleton className="h-full w-full" />
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-40" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <li key={i}>
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-5 w-16 ml-auto" />
                  <Skeleton className="h-6 w-20 ml-auto" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  </div>
);

// Empty Cart UI
const EmptyCart = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative h-48 w-48">
        <Image
          src="/empty-cart.svg"
          alt="Empty Cart"
          fill
          sizes="(max-width: 768px) 100vw, 192px"
        />
      </div>
      <p className="text-gray-500 text-center">
        Your cart is empty. Start shopping now!
      </p>
      <Button onClick={() => router.push("/home")}>Browse Products</Button>
    </div>
  );
};

// Confirm Delete Modal
const RemoveItemDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Remove Item</DialogTitle>
        <DialogDescription>
          Are you sure you want to remove this item from your cart?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Yes, Remove
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
