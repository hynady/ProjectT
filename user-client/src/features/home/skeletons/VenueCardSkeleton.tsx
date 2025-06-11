import { Card, CardHeader, CardContent } from "@/commons/components/card.tsx";
import { Skeleton } from "@/commons/components/skeleton.tsx";

export const RegionCardSkeleton = () => {
  return (
    <Card className="w-full">
      <CardHeader className="p-0">
        <Skeleton className="h-48 w-full rounded-t-lg"/>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-5 w-2/3"/>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full"/>
            <Skeleton className="h-4 w-20"/>
          </div>
          <Skeleton className="h-4 w-24"/>
        </div>
      </CardContent>
    </Card>
  );
};