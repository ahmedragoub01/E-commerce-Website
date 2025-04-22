"use client";
import { Table, TableBody, TableCaption, TableHeader, TableHead, TableRow, TableCell, TableFooter } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
  description?: string;
  parent?: { name: string };
  createdAt: string;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete category");
      }
      
      setCategories(categories.filter(category => category._id !== categoryId));
      alert("Category deleted successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Deletion failed");
    }
  };

  if (loading) {
    return <div className="p-4">Loading categories...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories Management</h1>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </div>

      <Table>
        <TableCaption>A list of product categories in your store</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Parent Category</TableHead>
            <TableHead>Added On</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category._id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>{category.description || "No description"}</TableCell>
              <TableCell>{category.parent?.name || "None"}</TableCell>
              <TableCell>
                {new Date(category.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/categories/edit/${category._id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(category._id)}
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
            <TableCell colSpan={4}>Total Categories</TableCell>
            <TableCell className="text-right">{categories.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}