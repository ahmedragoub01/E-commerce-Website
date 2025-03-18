"use client";

import React, { useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronLeft, Heart } from "lucide-react";
import Image from "next/image";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import ProductSection from "@/components/ProductSection";
import ProductSkeleton from "@/components/ProductSkeleton";
import Autoplay from "embla-carousel-autoplay";

// Fetch function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Product {
  id: string;
  images: string[];
  category?: { name: string };
  inventory: number;
  price: number;
  description: string;
}

const ProductImages = ({ images = [] }: { images?: string[] }) => (
  <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-lg border">
    <Carousel
      className="relative flex items-center w-full"
      plugins={[Autoplay({ delay: 4000 })]}
    >
      <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 p-4 bg-white/80 hover:bg-white shadow-md rounded-full transition-all z-10 w-12 h-12 cursor-pointer" />
      <CarouselContent className="pr-8 cursor-grab">
        {(images.length ? images : ["placeholder.svg"]).map((image, index) => (
          <CarouselItem key={index} className="flex justify-center w-full max-w-lg">
            <Image
              src={`/Products/${image}`}
              alt="Product image"
              width={400}
              height={400}
              className="rounded-lg object-cover w-full h-auto"
              unoptimized
              loading="lazy"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 p-4 bg-white/80 hover:bg-white shadow-md rounded-full transition-all z-10 w-12 h-12 cursor-pointer" />
    </Carousel>
  </div>
);

const ProductInfo = ({ product }: { product: Product }) => (
  <div>
    <Badge className="bg-indigo-700">{product.category?.name || "Uncategorized"}</Badge>
    {product.inventory <= 0 && <Badge variant="outline" className="text-red-500">Out of stock</Badge>}
    {product.inventory > 0 && product.inventory < 10 && (
      <Badge variant="outline" className="text-yellow-500">Only {product.inventory} left</Badge>
    )}
    <h2 className="text-3xl font-bold text-indigo-700 mt-4">${product.price.toFixed(2)}</h2>
    <p className="text-muted-foreground mt-2">{product.description || "No description available."}</p>
    <div className="flex gap-4 mt-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add to favorites</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button 
        className="flex-1 bg-indigo-700 hover:bg-indigo-800" 
        disabled={product.inventory <= 0}
      >
        Add to Cart
      </Button>
    </div>
  </div>
);

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Protect route: Redirect if unauthenticated
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  // Fetch Product & Related Products
  const { data: product, error: productError } = useSWR(`/api/products/${params.id}`, fetcher);
  const { data: randomProducts } = useSWR(`/api/products/random?limit=7`, fetcher);

  // Memoize data to prevent unnecessary re-renders
  const memoizedProduct = useMemo(() => product, [product]);
  const memoizedRandomProducts = useMemo(() => randomProducts, [randomProducts]);

  if (productError) return <p>Product not found.</p>;

  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <Button 
        variant="outline" 
        size="sm" 
        className="cursor-pointer mb-6 flex items-center gap-1 hover:text-indigo-600 transition-all duration-100 transform hover:scale-[1.05]" 
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>
      {!memoizedProduct ? (
        <ProductSkeleton />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <ProductImages images={memoizedProduct.images} />
          <ProductInfo product={memoizedProduct} />
        </div>
      )}
      {memoizedRandomProducts?.length > 0 && (
        <Suspense fallback={<div>Loading recommendations...</div>}>
          <ProductSection 
            title="You May Also Like" 
            products={memoizedRandomProducts} 
            emptyMessage="No related products found"
            onProductHover={() => {}}
          />
        </Suspense>
      )}
    </div>
  );
}
