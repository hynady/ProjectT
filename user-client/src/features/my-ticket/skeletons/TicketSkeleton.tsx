// components/skeletons/TicketSkeleton.tsx
import { Skeleton } from "@/commons/components/skeleton.tsx";

export const TicketSkeleton = () => {
  return (
    <div className="max-w-screen-xl mx-auto min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* Title Skeleton */}
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />

          {/* Next Event Skeleton */}
          <div className="mt-4 p-4 bg-primary/5 rounded-lg space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>

        <div className="mb-6 space-y-4">
          {/* Search & Filter Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-full sm:w-auto flex-1" />
            <Skeleton className="h-10 w-full sm:w-[180px]" />
          </div>

          {/* Ticket Stats Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-lg space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
            <div className="p-4 bg-card rounded-lg space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
            <div className="p-4 bg-card rounded-lg space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
            <div className="p-4 bg-card rounded-lg space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          </div>
        </div>

        <div className="relative">
          {/* Ticket List Skeleton */}
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-4 bg-card rounded-lg flex items-center gap-4"
              >
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>

          {/* No Tickets Skeleton */}
          <div className="text-center py-12">
            <Skeleton className="h-6 w-1/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-10 w-32 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};