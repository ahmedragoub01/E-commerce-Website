import { Skeleton } from "@/components/ui/skeleton"

export default function ProductSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 animate-pulse">
      {/* Image skeleton */}
      <div>
        <Skeleton className="aspect-square w-full rounded-lg bg-gray-200" />
      </div>
      
      {/* Product details skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4 bg-gray-200" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 bg-gray-200" />
          <Skeleton className="h-6 w-32 bg-gray-200" />
        </div>
        <Skeleton className="h-10 w-28 bg-gray-200" />
        
        <div>
          <Skeleton className="h-6 w-40 mb-2 bg-gray-200" />
          <Skeleton className="h-20 w-full bg-gray-200" />
        </div>
        
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10 bg-gray-200" />
          <Skeleton className="h-10 flex-1 bg-gray-200" />
        </div>
        
        <div className="space-y-2 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-5 w-20 mb-1 bg-gray-200" />
                <Skeleton className="h-5 w-24 bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}