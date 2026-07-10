import { Skeleton } from "@/components/ui/Skeleton";

export function ProductSkeleton() {
  return (
    <div className="flex flex-col space-y-4">
      <Skeleton className="aspect-3/4 rounded-2xl w-full" />
      <div className="space-y-2 flex flex-col items-center">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
