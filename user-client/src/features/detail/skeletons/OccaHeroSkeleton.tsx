import { Card } from "@/commons/components/card.tsx";
import { Skeleton } from "@/commons/components/skeleton.tsx";

export const OccaHeroSkeleton = () => {
  return (
    <div className="relative h-[80vh]">
      <Skeleton className="absolute inset-0" />
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 md:p-8">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-6">
            <div className="space-y-4">
              {/* Badge Skeleton */}
              <div className="hidden sm:flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-5 w-16" />
                ))}
              </div>

              {/* Title Skeleton */}
              <Skeleton className="h-8 sm:h-10 w-3/4" />

              {/* Artist Skeleton */}
              <Skeleton className="h-6 w-1/2" />

              {/* Event Details Skeleton */}
              <div className="hidden sm:flex gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};