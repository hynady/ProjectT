// components/search/OccaItem.tsx
import React from "react";
import { X } from "lucide-react";
import { OccaSearchItemBaseUnit } from "@/features/search/internal-types/search.type.ts";

interface OccaSearchItemBaseProps extends OccaSearchItemBaseUnit {
  showRemoveButton?: boolean;
  onRemove?: () => void;
}

export const OccaSearchItem: React.FC<
  OccaSearchItemBaseProps &
    (
      | { showRemoveButton: true; onRemove: () => void; onClick: () => void }
      | { showRemoveButton?: false; onClick: () => void }
    )
> = ({
  title,
  date,
  location,
  showRemoveButton = false,
  onClick,
  onRemove,
}) => {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer">
      <div className="w-full" onClick={onClick}>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">
          {new Date(date)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "/")}{" "}
          • {location}
        </p>
      </div>
      {showRemoveButton && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
