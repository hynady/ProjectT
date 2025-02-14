import { cn } from "@/commons/lib/utils/utils";

export function LoadingSkeleton() {
    return (
      <div className={cn(
        "min-h-[200px] p-4 space-y-4",
        "animate-in fade-in-0 duration-300"
      )}>
        {[1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-start space-x-4">
                <div className="h-14 w-14 rounded-md bg-gray-200 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }