import Skeleton from "@/components/Skeleton";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="relative flex items-center overflow-hidden">
        <div className="wrap relative z-10 pb-20 pt-16 md:pt-24">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-4 h-14 w-full max-w-2xl md:h-20" />
          <Skeleton className="mt-3 h-14 w-3/4 max-w-xl md:h-20" />
          <Skeleton className="mt-6 h-5 w-full max-w-lg" />
          <Skeleton className="mt-2 h-5 w-2/3 max-w-md" />
          <div className="mt-8 flex gap-4">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="plate-divider">
          <span className="plate-dot" />
          <span className="plate-dot" />
          <span className="plate-dot" />
        </div>
      </div>

      {/* Coaching preview skeleton */}
      <section className="wrap py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-9 w-full" />
            <Skeleton className="mt-2 h-9 w-3/4" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
          <div className="border border-line bg-surface p-6">
            <Skeleton className="aspect-4/3 w-full" />
            <Skeleton className="mt-4 h-6 w-1/2" />
            <Skeleton className="mt-2 h-3 w-3/4" />
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="plate-divider">
          <span className="plate-dot" />
          <span className="plate-dot" />
          <span className="plate-dot" />
        </div>
      </div>

      {/* Shop preview skeleton */}
      <section className="wrap py-20">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-3 h-9 w-2/3 max-w-sm" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      </section>
    </>
  );
}
