import { Card } from "@/commons/components/card.tsx";
import { Skeleton } from "@/commons/components/skeleton.tsx";

export const OccaGallerySkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-40" />
    <Skeleton className="h-[300px] sm:h-[400px] lg:h-[500px] w-full" />
  </div>
);

export const OccaLocationSkeleton = () => (
  <div className="lg:col-span-2 space-y-4">
    <Skeleton className="h-6 w-40" />
    <Skeleton className="aspect-video w-full" />
    <Card className="p-3 space-y-2">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-full" />
    </Card>
  </div>
);