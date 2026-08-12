import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="wrap py-16">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-11 w-40" />
      <Skeleton className="mt-4 h-4 w-full max-w-lg" />
      <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border border-line bg-surface p-6">
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="mt-4 h-6 w-1/2" />
            <Skeleton className="mt-2 h-3 w-2/3" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-1 h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
