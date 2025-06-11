import React from "react";
import { Badge } from "@/commons/components/badge.tsx";
import { X, Ribbon, MapPinned } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface FilterBadgesProps {
  categories: { id: string; name: string }[];
  regions: { id: string; name: string }[];
  onFilterChange: (type: string, value: string) => void;
  className?: string;
}

export const FilterBadges: React.FC<FilterBadgesProps> = ({
  categories,
  regions,
  onFilterChange,
  className = "",
}) => {
  const [searchParams] = useSearchParams();

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name || "";

  const getRegionName = (id: string) =>
    regions.find((r) => r.id === id)?.name || "";

  const categoryId = searchParams.get("categoryId");
  const regionId = searchParams.get("regionId");

  // Nếu không có filter nào thì không hiển thị gì
  if ((!categoryId || categoryId === "all") && (!regionId || regionId === "all")) {
    return null;
  }

  return (
    <div className={`flex gap-1 items-center ${className}`}>
      {categoryId && categoryId !== "all" && (
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center gap-1 text-xs px-2 py-0.5 h-6"
          onClick={() => onFilterChange("categoryId", "all")}
        >
          <Ribbon className="h-2.5 w-2.5" />
          <span className="max-w-[60px] overflow-hidden text-ellipsis whitespace-nowrap">
            {getCategoryName(categoryId)}
          </span>
          <X className="h-2.5 w-2.5" />
        </Badge>
      )}

      {regionId && regionId !== "all" && (
        <Badge
          variant="secondary"
          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center gap-1 text-xs px-2 py-0.5 h-6"
          onClick={() => onFilterChange("regionId", "all")}
        >
          <MapPinned className="h-2.5 w-2.5" />
          <span className="max-w-[60px] overflow-hidden text-ellipsis whitespace-nowrap">
            {getRegionName(regionId)}
          </span>
          <X className="h-2.5 w-2.5" />
        </Badge>
      )}
    </div>
  );
};
