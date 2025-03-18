import { Calendar, Clock } from "lucide-react";
import { Skeleton } from "@/commons/components/skeleton";

export const LoadingSkeleton = () => {
  return (
    <div className="space-y-4 py-2">
      {[1, 2].map((i) => (
        <div key={i} className="border rounded-md overflow-hidden">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Skeleton className="h-4 w-40" />
              <Clock className="h-4 w-4 ml-2 text-muted-foreground" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex items-center mt-1 gap-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
