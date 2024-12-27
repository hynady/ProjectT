import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CategorySkeleton = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-2"/>
        <Skeleton className="h-4 w-20"/>
      </CardHeader>
    </Card>
  );
};