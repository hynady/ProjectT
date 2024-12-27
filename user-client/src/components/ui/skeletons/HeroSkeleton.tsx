import { Skeleton } from "@/components/ui/skeleton";

export const HeroSkeleton = () => {
  return (
    <div className="w-full">
      <div className="relative aspect-[21/9] overflow-hidden rounded-lg">
        <Skeleton className="h-full w-full"/>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3"/>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full"/>
                <Skeleton className="h-4 w-24"/>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full"/>
                <Skeleton className="h-4 w-32"/>
              </div>
            </div>
            <Skeleton className="h-10 w-32"/>
          </div>
        </div>
      </div>
    </div>
  );
};