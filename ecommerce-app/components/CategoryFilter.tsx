import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function CategoryFilter({ categories, activeCategory, setActiveCategory, priceRange, setPriceRange }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Refine your product search</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="mb-2 font-medium">Categories</h3>
            <div className="space-y-2">
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory("all")}
                className={activeCategory === "all" ? "bg-indigo-700 hover:bg-indigo-800" : ""}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category._id}
                  variant={activeCategory === category._id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category._id)}
                  className={activeCategory === category._id ? "bg-indigo-700 hover:bg-indigo-800" : ""}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Price Range</h3>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                type="number" 
                placeholder="Min" 
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
              />
              <Input 
                type="number" 
                placeholder="Max" 
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
              />
            </div>
          </div>
        </div>
        <SheetFooter className="mt-6">
          <Button 
            className="w-full bg-indigo-700 hover:bg-indigo-800" 
            onClick={() => {
              // Reset filters
              setActiveCategory("all")
              setPriceRange({ min: "", max: "" })
            }}
          >
            Reset Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}