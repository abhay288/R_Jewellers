import { Skeleton } from "@/frontend/components/ui/Skeleton";

export function ProductSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="aspect-4/5 rounded-xl w-full" />
      <div className="space-y-2 flex flex-col items-center">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3.5 w-1/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-8 lg:gap-y-10">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
