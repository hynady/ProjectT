import React from 'react';
import { Ticket } from 'lucide-react';
import {OccaSearchItem, OccaSearchItemBaseUnit} from "@/features/search/components/OccaSearchItem.tsx";

export interface RecentOccaUnit extends OccaSearchItemBaseUnit{
  timestamp: Date;
}

interface RecentOccasProps {
  occas: RecentOccaUnit[];
  onOccaClick: (id: string) => void;
  onRemove: (id: string) => void;
}

export const RecentOccas: React.FC<RecentOccasProps> = ({
                                                          occas,
                                                          onOccaClick,
                                                          onRemove,
                                                        }) => {
  if (occas.length === 0) return null;

  return (
    <div className="pl-4 p-2">
      <h3 className="flex items-center gap-2 font-medium mb-2">
        <Ticket className="w-4 h-4"/>
        Sự kiện đã xem gần đây
      </h3>
      <div className="space-y-2">
        {occas.map((occa) => (
          <OccaSearchItem
            key={`recent-occa-${occa.id}`}
            {...occa}
            showRemoveButton={true}
            onClick={() => onOccaClick(occa.id)}
            onRemove={() => onRemove(occa.id)}
          />
        ))}
      </div>
    </div>
  );
};