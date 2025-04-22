"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronLeft,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  Clock,
  Eye,
} from "lucide-react";
import Image from "next/image";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import ProductSkeleton from "@/components/ProductSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Product {
  id?: string;
  _id: string;
  name: string;
  images: string[];
  category?: { name: string; _id: string };
  inventory: number;
  price: number;
  description: string;
  features?: string[];
  specifications?: Record<string, string>;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ProductImages = ({
  images = [],
  name = "Product",
}: {
  images?: string[];
  name?: string;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-sm border overflow-hidden"
    >
      <Carousel
        className="relative flex items-center w-full"
        plugins={[Autoplay({ delay: 5000 })]}
        onSlideChange={setActiveIndex}
      >
        <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 hover:bg-white shadow-md rounded-full transition-all z-10 w-10 h-10 cursor-pointer" />
        <CarouselContent className="pr-8 cursor-grab">
          {(images.length ? images : ["placeholder.svg"]).map(
            (image, index) => (
              <CarouselItem
                key={index}
                className="flex justify-center w-full pt-6 pb-12"
              >
                <div className="relative group">
                  <Image
                    src={`/Products/${image}`}
                    alt={`${name} - Image ${index + 1}`}
                    width={500}
                    height={500}
                    className="rounded-lg object-contain w-full h-auto transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/80 hover:bg-white"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            )
          )}
        </CarouselContent>
        <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 hover:bg-white shadow-md rounded-full transition-all z-10 w-10 h-10 cursor-pointer" />
      </Carousel>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 px-4 pb-4">
          {images.map((_, index) => (
            <div
              key={`thumb-${index}`}
              className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                activeIndex === index ? "bg-blue-600 w-4" : "bg-gray-300"
              }`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

const ProductInfo = ({
  product,
  session,
}: {
  product: Product;
  session: any;
}) => {
  const { id: productId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if (!session?.user?.id) {
      toast.warning("Please log in to add items to your cart");
      return;
    }

    if (!product) {
      toast.error("Invalid product. Please try again.");
      return;
    }

    if (product.inventory <= 0) {
      toast.error("Sorry, this item is out of stock");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/cart/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          productId,
          quantity,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add item to cart");
      }

      toast.success(result.message || "Item added to cart successfully");
      mutate("/api/cart");
    } catch (error: any) {
      toast.error(error.message || "Failed to add item to cart");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>

      <div className="flex flex-wrap gap-2">
        <Badge className="bg-blue-600 py-1 px-3">
          {product.category?.name || "Uncategorized"}
        </Badge>
        {product.inventory <= 0 ? (
          <Badge variant="outline" className="text-red-500 py-1 px-3">
            Out of stock
          </Badge>
        ) : product.inventory < 10 ? (
          <Badge variant="outline" className="text-amber-500 py-1 px-3">
            Only {product.inventory} left
          </Badge>
        ) : (
          <Badge variant="outline" className="text-green-500 py-1 px-3">
            In Stock
          </Badge>
        )}
      </div>

      <div className="py-2 border-y border-gray-200">
        <h2 className="text-4xl font-bold text-blue-600">
          $
          {typeof product.price === "number"
            ? product.price.toFixed(2)
            : "0.00"}
        </h2>
      </div>

      <Tabs defaultValue="description" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="description" className="flex-1">
            Description
          </TabsTrigger>
          <TabsTrigger value="features" className="flex-1">
            Features
          </TabsTrigger>
          <TabsTrigger value="specs" className="flex-1">
            Specifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="pt-4">
          <p className="text-gray-700 leading-relaxed">
            {product.description || "No description available."}
          </p>
        </TabsContent>

        <TabsContent value="features" className="pt-4">
          {product.features && product.features.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No features specified</p>
          )}
        </TabsContent>

        <TabsContent value="specs" className="pt-4">
          {product.specifications &&
          Object.keys(product.specifications).length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="pb-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">{key}:</span>{" "}
                  <span className="text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No specifications available</p>
          )}
        </TabsContent>
      </Tabs>

      <div className="pt-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-md">
            <button
              className="px-3 py-2 text-gray-500 hover:text-blue-600 disabled:opacity-50"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="w-12 text-center">{quantity}</span>
            <button
              className="px-3 py-2 text-gray-500 hover:text-blue-600 disabled:opacity-50"
              onClick={() =>
                setQuantity(Math.min(product.inventory, quantity + 1))
              }
              disabled={quantity >= product.inventory}
            >
              +
            </button>
          </div>

          <Button
            className="flex-1 py-6 cursor-pointer bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            disabled={product.inventory <= 0 || isLoading}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {isLoading ? "Adding..." : "Add to Cart"}
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="p-6 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
                >
                  <Heart className="h-5 w-5 text-indigo-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add to favorites</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
          <Truck className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm font-medium">Free Shipping</p>
            <p className="text-xs text-gray-500">On orders over $50</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
          <Shield className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm font-medium">2-Year Warranty</p>
            <p className="text-xs text-gray-500">Full coverage</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
          <Clock className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm font-medium">30-Day Returns</p>
            <p className="text-xs text-gray-500">Hassle-free process</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RelatedProducts = ({
  categoryId,
  currentProductId,
}: {
  categoryId?: string;
  currentProductId: string;
}) => {
  const router = useRouter();
  const { data: relatedProducts, error } = useSWR(
    categoryId ? `/api/products?category=${categoryId}&limit=8` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const filteredProducts = relatedProducts
    ?.filter((product: Product) => {
      // Ensure both IDs are compared as strings
      return product._id.toString() !== currentProductId;
    })
    .slice(0, 8);

  if (error) return null;
  if (!filteredProducts || filteredProducts.length === 0) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="mt-12 py-8 border-t border-gray-200"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        You May Also Like
      </h2>
      <Carousel opts={{ loop: true, align: "start" }} className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {filteredProducts.map((product: Product) => (
            <CarouselItem
              key={product._id}
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <ProductCard
                product={product}
                showCategory={true}
                onView={() => router.push(`/products/${product._id}`)}
                index={0}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center mt-6 gap-2">
          <CarouselPrevious className="static transform-none mx-2 bg-indigo-50 hover:bg-indigo-100 text-blue-600" />
          <CarouselNext className="static transform-none mx-2 bg-indigo-50 hover:bg-indigo-100 text-blue-600" />
        </div>
      </Carousel>
    </motion.div>
  );
};

export default function ProductDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  const { data: product, error: productError } = useSWR<Product>(
    id ? `/api/products/${id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (productError)
    return (
      <div className="container flex flex-col items-center justify-center py-20">
        <Image
          src="/not-found.svg"
          alt="Product not found"
          width={300}
          height={300}
          className="mb-6"
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Product Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't find the product you're looking for.
        </p>
        <Button
          onClick={() => router.push("/products")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Browse Products
        </Button>
      </div>
    );

  return (
    <>
      {/* Sticky navigation bar */}
      <div
        className={`sticky top-0 z-50 w-full bg-white border-b border-gray-200 transition-all duration-300 ${
          scrolled ? "shadow-md py-3" : "py-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {product && (
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-800 truncate max-w-xs">
                {product.name}
              </span>
              <span className="font-bold text-blue-600">
                $
                {typeof product.price === "number"
                  ? product.price.toFixed(2)
                  : "0.00"}
              </span>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!product || product.inventory <= 0}
                onClick={() => {
                  if (session?.user?.id) {
                    fetch("/api/cart/add-item", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId: session.user.id,
                        productId: id,
                        quantity: 1,
                      }),
                    }).then(() => {
                      toast.success("Item added to cart");
                      mutate("/api/cart");
                    });
                  } else {
                    toast.warning("Please log in to add items to your cart");
                  }
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container px-4 py-6 md:px-6 md:py-12">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer mb-6 flex items-center gap-1 hover:text-indigo-600 transition-all duration-100 transform hover:scale-105"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Button>

        {!product ? (
          <ProductSkeleton />
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2">
              <ProductImages images={product.images} name={product.name} />
              <ProductInfo product={product} session={session} />
            </div>

            <Suspense
              fallback={
                <div className="mt-12 py-4 text-center text-gray-500">
                  Loading recommendations...
                </div>
              }
            >
              <RelatedProducts
                categoryId={product.category?._id}
                currentProductId={id}
              />
            </Suspense>
          </>
        )}
      </div>
    </>
  );
}
