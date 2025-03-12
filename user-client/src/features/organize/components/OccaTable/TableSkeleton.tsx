import { Skeleton } from "@/commons/components/skeleton";

export const TableSkeleton = () => {
  return (
    <div className="flex flex-col h-full border rounded-md animate-pulse">
      <div className="px-4 py-4 border-b">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="space-y-5">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[80%]" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-[30%]" />
                  <Skeleton className="h-3 w-[20%]" />
                  <Skeleton className="h-3 w-[15%]" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
