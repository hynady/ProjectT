import React from 'react';
import {OccaSearchItem, OccaSearchItemBaseUnit} from "@/app/searchsystem/components/fragments/occaItem/OccaSearchItem.tsx";

export interface SuggestOccaUnit extends OccaSearchItemBaseUnit {

}

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
      <div className="space-y-2">
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