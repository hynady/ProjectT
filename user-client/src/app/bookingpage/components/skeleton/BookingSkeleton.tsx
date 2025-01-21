import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export const BookingSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Card Skeleton */}
      <Card className="p-6">
        <div className="space-y-8">
          {/* Title Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-2/3 md:w-1/2" />
            <Skeleton className="h-4 w-1/2 md:w-1/3" />
          </div>

          {/* Progress Skeleton */}
          <div className="px-6 -mx-6 pb-6">
            <Skeleton className="w-full h-2" />
            <div className="flex justify-between mt-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Content Skeleton */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-6">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-7">
          <div className="space-y-4 rounded-lg border p-6">
            <Skeleton className="h-6 w-48" /> {/* Section title */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            <div className="flex justify-end gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        {/* Summary Skeleton */}
        <div className="lg:col-span-5 mt-6 lg:mt-0">
          <div className="rounded-lg border p-6 space-y-4">
            <Skeleton className="h-6 w-36" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};