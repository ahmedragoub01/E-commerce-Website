import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  category?: {
    name: string;
  };
  inventory: number;
}

interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
  onView?: () => void;
  onProductHover?: (productId: string) => void;
  index?: number;
}

const cardVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: 0.05, // Base delay to stagger animations
    },
  },
  hover: {
    y: -5,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3 },
  },
  vibrate: {
    y: [0, -8, 8, -8, 8, 0], // Creates a small shaking effect
    transition: { duration: 0.5 },
  },
};

export default function ProductCard({
  product,
  showCategory = false,
  onView,
  onProductHover,
  index = 0,
}: ProductCardProps) {
  const controls = useAnimation();
  const router = useRouter();

  useEffect(() => {
    controls.start("animate");
  }, [controls]);

  const handleViewProduct = async () => {
    controls.start("vibrate"); // Play vibrate animation // Track product view if needed
    router.push(`/product/${product._id}`); // Instantly navigate
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate={controls}
      whileHover="hover"
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => onProductHover && onProductHover(product._id)}
    >
      <Card className="overflow-hidden h-full">
        <div className="cursor-pointer aspect-square overflow-hidden relative">
          <Image
            src={`/Products/${product.images?.[0] || "placeholder.svg"}`}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="h-full w-full transition-transform duration-700 hover:scale-110"
            loading="lazy"
            unoptimized
          />
          {showCategory && product.category && (
            <Badge className="absolute top-2 right-2 bg-indigo-700">
              {product.category.name}
            </Badge>
          )}
        </div>
        <CardContent className="p-4 cursor-pointer">
          <h3 className="line-clamp-1 font-medium">{product.name}</h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-bold text-indigo-700">${product.price.toFixed(2)}</span>
            {product.inventory <= 0 && (
              <Badge variant="outline" className="text-red-500">
                Out of stock
              </Badge>
            )}
          </div>
          <div className="mt-4">
            <Button
              className="cursor-pointer w-full bg-indigo-700 hover:bg-indigo-800"
              onClick={handleViewProduct}
            >
              See Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}