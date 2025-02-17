import { Card } from "@/commons/components/card.tsx";
import { Skeleton } from "@/commons/components/skeleton.tsx";

export const OccaShowsSkeleton = () => {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <Skeleton className="h-6 w-40" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-12" />
            <div className="space-y-2 mt-2">
              {[1, 2, 3].map((j) => (
                <Card key={j} className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-9 w-16" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
        <Skeleton className="h-12 w-full" />
      </div>
    </Card>
  );
};