"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  price: number;
  inventory: number;
  category?: { name: string };
  createdAt: string;
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter((product) => product._id !== productId));
      alert("Product deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="p-4">Loading products...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Link href="/admin/products/new">
          <Button className="bg-blue-500 text-white hover:bg-blue-600">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Table>
        <TableCaption>A list of products in your store</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Added On</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell>{product.inventory}</TableCell>
              <TableCell>{product.category?.name || "Uncategorized"}</TableCell>
              <TableCell>
                {new Date(product.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/products/edit/${product._id}`}>
                    <Button
                      className="text-yellow-500 hover:text-white hover:bg-yellow-500"
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    className="text-red-600 hover:text-white hover:bg-red-600"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>Total Products</TableCell>
            <TableCell className="text-right">{products.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
