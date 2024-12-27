import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const VenueCardSkeleton = () => {
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