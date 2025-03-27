import ProductCard from "./ProductCard"
import { useRouter } from 'next/navigation';


interface Product {
  _id: string;
  name: string;
  price: number;
  inventory: number;
  // Define other product properties here
}



interface ProductGridProps {
  products: Product[];
  trackProductView: (productId: string) => void;
  router: ReturnType<typeof useRouter>;
}

export default function ProductGrid({ products, trackProductView, router }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center">
        <p className="text-muted-foreground">No products found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product: Product) => (
        <ProductCard
          key={product._id}
          product={product}
          showCategory={true}
          onView={() => trackProductView(product._id)}
        />
      ))}
    </div>
  );
}