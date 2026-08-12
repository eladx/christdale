import Skeleton from "@/components/Skeleton";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function Loading() {
  return (
    <div className="wrap py-16">
      <Skeleton className="h-3 w-12" />
      <Skeleton className="mt-3 h-11 w-48" />

      <div className="mt-10 flex flex-col gap-8 md:flex-row">
        {/* Filter sidebar skeleton */}
        <aside className="w-full shrink-0 space-y-6 md:w-56">
          <div>
            <Skeleton className="h-3 w-14" />
            <Skeleton className="mt-2 h-9 w-full" />
          </div>
          <div>
            <Skeleton className="h-3 w-16" />
            <div className="mt-2 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
        </aside>

        {/* Grid skeleton */}
        <div className="flex-1">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
