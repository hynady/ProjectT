import { Card, CardHeader } from "@/commons/components/card.tsx";
import { Skeleton } from "@/commons/components/skeleton.tsx";

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