import React from 'react';
import { ArrowRight } from 'lucide-react';
import {OccaSearchItem, OccaSearchItemBaseUnit} from "@/app/searchsystem/components/fragments/occaItem/OccaSearchItem.tsx";

export interface SearchResultUnit extends OccaSearchItemBaseUnit {
}

interface SearchResultsProps {
  query: string;
  results: SearchResultUnit[];
  isLoading: boolean;
  onOccaClick: (occa: SearchResultUnit) => void;
  onSearchSubmit: (query: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
                                                              query,
                                                              results,
                                                              isLoading,
                                                              onOccaClick,
                                                              onSearchSubmit,
                                                            }) => {
  return (
    <div className="pl-4 p-2">
      <h3 className="font-medium mb-2">Kết quả tìm kiếm</h3>

      <div
        className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer text-primary font-bold"
        onClick={() => onSearchSubmit(query)}
      >
        Tìm kiếm với từ khóa "{query}"
        <ArrowRight className="w-4 h-4"/>
      </div>

      <div>
        {isLoading ? (
          <div className="text-center py-2">Đang tìm kiếm...</div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            {results.map((occa) => (
              <OccaSearchItem
                key={`search-${occa.id}`}
                {...occa}
                onClick={() => onOccaClick(occa)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-2 text-muted-foreground">
            Không tìm thấy sự kiện cụ thể nào
          </div>
        )}
      </div>
    </div>
  );
};