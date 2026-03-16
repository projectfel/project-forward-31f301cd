import { Skeleton } from "@/components/ui/skeleton";

export const StoreCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border bg-card">
    <Skeleton className="h-44 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-18 rounded-full" />
      </div>
    </div>
  </div>
);

export const ProductCardSkeleton = () => (
  <div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3 w-10" />
      <Skeleton className="h-6 w-20" />
    </div>
    <Skeleton className="h-11 w-11 rounded-xl" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  </div>
);
