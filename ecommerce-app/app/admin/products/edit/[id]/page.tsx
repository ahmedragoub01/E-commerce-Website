"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
// import { DateTimePicker } from "@/components/ui/date-time-picker";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  category: string;
  isAuction: boolean;
  auctionEndDate?: Date;
  currentBid?: number;
  images: string[];
}

interface Category {
  _id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    inventory: "",
    category: "None",
    isAuction: false,
    auctionEndDate: new Date(),
    currentBid: "",
    images: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productRes] = await Promise.all([
          fetch("/api/categories"),
          fetch(`/api/products/${id}`),
        ]);

        if (!categoriesRes.ok || !productRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [categoriesData, productData] = await Promise.all([
          categoriesRes.json(),
          productRes.json(),
        ]);

        setCategories(categoriesData);
        setProduct(productData);

        setFormData({
          name: productData.name,
          description: productData.description || "",
          price: productData.price.toString(),
          inventory: productData.inventory.toString(),
          category:  productData.category || "None",
          isAuction: productData.isAuction || false,
          auctionEndDate: productData.auctionEndDate ? new Date(productData.auctionEndDate) : new Date(),
          currentBid: productData.currentBid?.toString() || "",
          images: productData.images || [],
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load product data");
        router.push("/admin/products");
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const uploadedImages: string[] = [];

      for (const file of files) {
        // Mock upload - replace with actual upload logic
        const mockUpload = new Promise<string>((resolve) => {
          setTimeout(() => {
            const mockUrl = URL.createObjectURL(file);
            resolve(mockUrl);
          }, 500);
        });

        const imageUrl = await mockUpload;
        uploadedImages.push(imageUrl);
      }

      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedImages],
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        inventory: parseInt(formData.inventory),
        category: formData.category,
        isAuction: formData.isAuction,
        ...(formData.isAuction && {
          auctionEndDate: formData.auctionEndDate,
          currentBid: parseFloat(formData.currentBid) || 0,
        }),
        images: formData.images,
      };

      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      toast.success("Product updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update product");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product deleted successfully");
      router.push("/admin/products");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-red-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Back to Products
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventory">Inventory</Label>
                <Input
                  id="inventory"
                  name="inventory"
                  type="number"
                  min="0"
                  value={formData.inventory}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Auction Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Auction Settings</h2>
            <div className="flex items-center space-x-2">
              {/* <Switch
                id="isAuction"
                checked={formData.isAuction}
                onCheckedChange={(checked) => handleSwitchChange("isAuction", checked)}
              /> */}
              <Label htmlFor="isAuction">Enable Auction</Label>
            </div>

            {formData.isAuction && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="auctionEndDate">Auction End Date</Label>
                  {/* <DateTimePicker
                    date={formData.auctionEndDate}
                    setDate={(date) => setFormData({ ...formData, auctionEndDate: date })}
                  /> */}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentBid">Current Bid</Label>
                  <Input
                    id="currentBid"
                    name="currentBid"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.currentBid}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {/* Images */}
            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-semibold">Images</h2>
              <div className="space-y-2">
                <Label>Upload Additional Images</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <p className="text-sm text-muted-foreground">
                  Upload product images (max 5MB each)
                </p>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="rounded-md h-24 w-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}