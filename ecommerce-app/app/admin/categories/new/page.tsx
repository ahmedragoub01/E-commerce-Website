"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

export default function AddCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: "no-parent",
    image: ""
  });

  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setParentCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load parent categories");
      }
    };
    fetchParentCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          image: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          parent: formData.parent==="no-parent" ? null:formData.parent, 
          image: formData.image
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create category");
      }

      toast.success("Category created successfully");
      router.push("/admin/categories");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create category");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Add New Category</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/categories")}
        >
          Back to Categories
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Category Details</h2>
            
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category (Optional)</Label>
              <Select
                value={formData.parent}
                onValueChange={(value) => setFormData({ ...formData, parent: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-parent">None</SelectItem>
                  {parentCategories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Category Image</h2>
            
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <p className="text-sm text-muted-foreground">
                Recommended size: 800x600px
              </p>
            </div>

            {formData.image && (
              <div className="mt-4">
                <Label>Preview</Label>
                <div className="mt-2 relative w-full h-48 border rounded-md overflow-hidden">
                  <img
                    src={formData.image}
                    alt="Category preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/categories")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Creating..." : "Create Category"}
          </Button>
        </div>
      </form>
    </div>
  );
}