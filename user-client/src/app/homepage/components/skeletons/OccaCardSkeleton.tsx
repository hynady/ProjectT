import { Card, CardHeader, CardContent } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export const OccaCardSkeleton = () => {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-2 p-0">
        <Skeleton className="h-48 w-full rounded-t-lg"/>
      </CardHeader>
      <CardContent className="space-y-2 p-6">
        <Skeleton className="h-4 w-3/4"/>
        <Skeleton className="h-4 w-1/2"/>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full"/>
            <Skeleton className="h-4 w-24"/>
            <Skeleton className="h-4 w-4 rounded-full"/>
            <Skeleton className="h-4 w-24"/>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full"/>
            <Skeleton className="h-4 w-40"/>
          </div>
          <Skeleton className="h-4 w-28"/>
        </div>
        <Skeleton className="h-10 w-full mt-4"/>
      </CardContent>
    </Card>
  );
};
