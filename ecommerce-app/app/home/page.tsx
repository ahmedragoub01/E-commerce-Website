"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import UserHeader from "@/components/UserHeader";
import CategoryFilter from "@/components/CategoryFilter";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProductSection from "@/components/ProductSection";
import ProductGrid from "@/components/ProductGrid";
import Pagination from "@/components/Pagination";
import { fetchProducts, fetchCategories } from "@/lib/api";

const ITEMS_PER_PAGE = 12;

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  });

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track filter/search state
  useEffect(() => {
    const filterActive =
      searchQuery !== "" ||
      activeCategory !== "all" ||
      priceRange.min !== "" ||
      priceRange.max !== "";

    setIsFilterActive(filterActive);
    setCurrentPage(1);
  }, [searchQuery, activeCategory, priceRange]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setPriceRange({ min: "", max: "" });
  };

  // Filtering logic
  const filteredProducts = useMemo(() => {
    if (!isMounted) return [];

    return products
      .filter((product) => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          activeCategory === "all" ||
          (product.category ? product.category._id === activeCategory : false);
        const matchesMinPrice =
          priceRange.min === "" || product.price >= Number(priceRange.min);
        const matchesMaxPrice =
          priceRange.max === "" || product.price <= Number(priceRange.max);
        return (
          matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price;
          case "price-high":
            return b.price - a.price;
          case "newest":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          default:
            return 0;
        }
      });
  }, [products, searchQuery, activeCategory, priceRange, sortBy, isMounted]);

  // Pagination logic
  const paginatedProducts = useMemo(() => {
    if (!isMounted) return [];

    const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(firstPageIndex, lastPageIndex);
  }, [filteredProducts, currentPage, isMounted]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // Render loading state
  if (status === "loading" || loadingProducts || loadingCategories) {
    return <LoadingSpinner />;
  }

  // Render main content
  return (
    <div className="container mx-auto px-4 py-6 lg:px-4 lg:py-8">
      <UserHeader session={session} router={router} />

      {/* Search and Filter Section */}
      <div className="mb-4">
        <div className="flex items-center gap-4">
          <div className="relative ">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground " />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-8 "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isFilterActive && (
              <button
                onClick={clearFilters}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </div>
      </div>

      {/* Conditional Rendering Based on Filter/Search State */}
      {isFilterActive ? (
        // Filtered Results View
        <div>
          <h2 className="text-xl font-bold mb-4">
            {filteredProducts.length} Results
            {searchQuery && ` for "${searchQuery}"`}
          </h2>

          <ProductGrid
            products={paginatedProducts}
            router={router}
            gridClassName="grid grid-cols-2 md:grid-cols-4 gap-4"
          />

          {filteredProducts.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {filteredProducts.length === 0 && (
            <p className="text-center text-muted-foreground mt-8">
              No products found matching your search criteria.
            </p>
          )}
        </div>
      ) : (
        // Default View with All Sections
        <>
          <ProductSection
            title="Recommended For You"
            products={products.slice(0, 8)}
            emptyMessage="We'll recommend products as you browse the store!"
            gridClassName="grid grid-cols-2 md:grid-cols-4 gap-4"
          />

          <Tabs defaultValue="products" className="w-full mt-12">
            <TabsContent value="products" className="mt-6">
              <ProductGrid
                products={products.slice(0, ITEMS_PER_PAGE)}
                router={router}
                gridClassName="grid grid-cols-2 md:grid-cols-4 gap-4"
              />
            </TabsContent>
          </Tabs>

          <ProductSection
            title="New Arrivals"
            products={products.slice(8, 16)}
            emptyMessage="Check back soon for new products!"
            gridClassName="grid grid-cols-2 md:grid-cols-4 gap-4"
          />

          <ProductSection
            title="Popular Now"
            products={products.slice(16, 24)}
            emptyMessage="Our popular products are coming soon!"
            gridClassName="grid grid-cols-2 md:grid-cols-4 gap-4"
          />
        </>
      )}
    </div>
  );
}
