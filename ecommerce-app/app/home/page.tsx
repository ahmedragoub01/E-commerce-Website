"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Search } from "lucide-react"
import { useQuery } from "@tanstack/react-query"


import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import UserHeader from "@/components/UserHeader"
import CategoryFilter from "@/components/CategoryFilter"
import LoadingSpinner from "@/components/LoadingSpinner"
import ProductSection from "@/components/ProductSection"
import ProductGrid from "@/components/ProductGrid"

// Fonction pour récupérer les produits
const fetchProducts = async () => {
  const res = await fetch('/api/products')
  return res.json()
}

// Fonction pour récupérer les catégories
const fetchCategories = async () => {
  const res = await fetch('/api/categories')
  return res.json()
}

export default function Dashboard() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login")
    },
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [flashVisible, setFlashVisible] = useState(true)

  // Chargement des données avec React Query
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // Cache pendant 5 minutes
  })

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  })

  // Récupération de l'historique depuis localStorage avec useMemo
  const viewingHistory = useMemo(() => {
    return JSON.parse(localStorage.getItem("viewingHistory") || "[]")
  }, [])

  // Gère le flash screen
  useEffect(() => {
    const timer = setTimeout(() => setFlashVisible(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Génération des sections de produits
  const generateProductSections = (products, history) => {
    const newest = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8)
    const popular = [...products].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8)

    let recommendations = []
    if (history.length > 0) {
      const viewedCategories = history.map((item) => item.categoryId)
      recommendations = products.filter((product) => product.category && viewedCategories.includes(product.category._id))
      
      const viewedIds = history.map((item) => item.productId)
      recommendations = recommendations.filter((product) => !viewedIds.includes(product._id))

      if (recommendations.length < 8) {
        const additionalRecommendations = popular
          .filter((product) => !recommendations.some((p) => p._id === product._id) && !viewedIds.includes(product._id))
          .slice(0, 8 - recommendations.length)

        recommendations = [...recommendations, ...additionalRecommendations]
      }
    } else {
      recommendations = popular
    }

    return { newest, popular, recommendations }
  }

  const { newest, popular, recommendations } = useMemo(() => {
    return generateProductSections(products, viewingHistory)
  }, [products, viewingHistory])

  // Appliquer les filtres et le tri
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = activeCategory === "all" || (product.category && product.category._id === activeCategory)
        const matchesMinPrice = priceRange.min === "" || product.price >= Number(priceRange.min)
        const matchesMaxPrice = priceRange.max === "" || product.price <= Number(priceRange.max)
        return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price
          case "price-high":
            return b.price - a.price
          case "newest":
            return new Date(b.createdAt) - new Date(a.createdAt)
          default:
            return 0
        }
      })
  }, [products, searchQuery, activeCategory, priceRange, sortBy])

  if (status === "loading" || loadingProducts || loadingCategories) {
    return <LoadingSpinner />
  }

  return (

      <div className="container px-4 py-6 md:px-6 md:py-8">
        <UserHeader session={session} router={router} />

        {/* Barre de recherche mobile */}
        <div className="mb-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search products..." className="w-full pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Shop Products</h1>
          <div className="hidden md:flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search products..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <CategoryFilter categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} priceRange={priceRange} setPriceRange={setPriceRange} />
          </div>
        </div>
        <ProductSection title="Recommended For You" products={recommendations} emptyMessage="We'll recommend products as you browse the store!" />
        <Tabs defaultValue="products" className="w-full mt-12">
          <TabsContent value="products" className="mt-6">
            <ProductGrid products={filteredProducts} router={router} />
          </TabsContent>
        </Tabs>
        <ProductSection title="New Arrivals" products={newest} emptyMessage="Check back soon for new products!" />
        <ProductSection title="Popular Now" products={popular} emptyMessage="Our popular products are coming soon!" />


      </div>
  )
}
