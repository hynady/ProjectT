import { Card, CardHeader, CardContent, CardFooter } from "@/commons/components/card.tsx";
import { Skeleton } from "@/commons/components/skeleton.tsx";

export const OccaCardSkeleton = () => {
  return (
    <Card className="w-full flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="relative">
          <Skeleton className="h-48 w-full"/>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6 flex-1">
        {/* Title */}
        <Skeleton className="h-6 w-3/4"/>
        
        <div className="space-y-2">
          {/* Date and Time row */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full"/>
            <Skeleton className="h-4 w-24"/>
            <Skeleton className="h-4 w-4 rounded-full ml-2"/>
            <Skeleton className="h-4 w-24"/>
          </div>
          
          {/* Location row */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full"/>
            <Skeleton className="h-4 w-40"/>
          </div>
          
          {/* Price */}
          <Skeleton className="h-4 w-24 mt-2"/>
        </div>
      </CardContent>
      
      <CardFooter>
        <Skeleton className="h-10 w-full"/>
      </CardFooter>
    </Card>
  );
};
