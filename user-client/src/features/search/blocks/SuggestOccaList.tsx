import React from 'react';
import {OccaSearchItem} from "@/features/search/components/OccaSearchItem.tsx";
import {OccaSearchItemBaseUnit} from "@/features/search/internal-types/search.type.ts";

export type SuggestOccaUnit = OccaSearchItemBaseUnit

interface SuggestOccaListProps {
  title: string;
  icon: React.ReactNode;
  occas: SuggestOccaUnit[];
  onOccaClick: (occa: SuggestOccaUnit) => void;
}

export const SuggestOccaList: React.FC<SuggestOccaListProps> = ({
                                                                  title,
                                                                  icon,
                                                                  occas,
                                                                  onOccaClick,
                                                                }) => {
  return (
    <div className="pl-4 p-2">
      <h3 className="flex items-center gap-2 font-medium mb-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-0">
        {occas.map((occa) => (
          <OccaSearchItem
            key={`${title}-${occa.id}`}
            {...occa}
            onClick={() => onOccaClick(occa)}
          />
        ))}
      </div>
    </div>
  );
};