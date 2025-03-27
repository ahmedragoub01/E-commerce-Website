import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category?: string;
}

interface ProductSectionProps {
  title: string;
  products: Product[];
  emptyMessage?: string;
  onProductHover?: (product: Product, index: number) => void;
}

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export default function ProductSection({
  title,
  products,
  emptyMessage,
  onProductHover,
}: ProductSectionProps) {
  const router = useRouter();

  if (!products || products.length === 0) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <p className="text-muted-foreground">
          {emptyMessage || "No products available."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <motion.h2
        className="text-2xl font-bold mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h2>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {products.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            showCategory={true}
            router={router}
            onProductHover={onProductHover}
            onView={() => router.push(`/products/${product._id}`)}
            index={index}
          />
        ))}
      </motion.div>
    </div>
  );
}
