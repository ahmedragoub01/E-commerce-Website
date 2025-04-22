"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SelectProductPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSelectProduct = (product: any) => {
    // Get the saved form data
    const savedData = sessionStorage.getItem('auctionFormData');
    const formData = savedData ? JSON.parse(savedData) : {};
    
    // Update with selected product
    const updatedData = {
      ...formData,
      productId: product._id,
      productName: product.name,
    };
    
    // Save back to session storage just in case
    sessionStorage.setItem('auctionFormData', JSON.stringify(updatedData));
    
    // Redirect back to create auction page
    router.back();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Select a Product</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div>Loading products...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product._id} className="border rounded-lg p-4">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-2">ID: {product._id}</p>
              <Button
                size="sm"
                onClick={() => handleSelectProduct(product)}
              >
                Select
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}