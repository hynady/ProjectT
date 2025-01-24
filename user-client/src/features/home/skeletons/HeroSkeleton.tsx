import { Skeleton } from "@/commons/components/skeleton.tsx";

export const HeroSkeleton = () => {
  return (
    <div className="w-full">
      <div className="-ml-4 flex">
        {/* Tạo 2 skeleton items để match với carousel */}
        {[1, 2].map((item) => (
          <div key={item} className="pl-4 md:basis-full lg:basis-1/2 min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border">
              {/* Image skeleton */}
              <Skeleton className="w-full h-full" />

              {/* Gradient overlay skeleton */}
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-primary/20 via-background/10 to-transparent" />

              {/* Content skeleton */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <div className="max-w-screen-xl mx-auto">
                  {/* Title skeleton */}
                  <Skeleton className="h-6 sm:h-8 md:h-10 lg:h-12 w-2/3 mb-2" />

                  {/* Badges skeleton */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
                      <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
                      <Skeleton className="h-3 sm:h-4 w-20 sm:w-32" />
                    </div>
                  </div>

                  {/* Button skeleton */}
                  <Skeleton className="h-8 sm:h-9 w-24 sm:w-32" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};