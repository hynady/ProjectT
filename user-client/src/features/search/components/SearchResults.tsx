import React from "react";
import { ArrowRight, SearchCheck } from "lucide-react";
import { OccaSearchItem } from "@/features/search/components/OccaSearchItem.tsx";
import { SearchResultUnit } from "@/features/search/internal-types/search.type";
import { LoadingDots } from "@/features/search/components/LoadingDots";

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

      <h3 className="flex items-center gap-2 font-medium mb-2">
        <SearchCheck className="w-4 h-4" />
        Kết quả tìm kiếm
      </h3>

      <div
        className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer text-primary font-bold"
        onClick={() => onSearchSubmit(query)}
      >
        Tìm kiếm với từ khóa "{query}"
        <ArrowRight className="w-4 h-4" />
      </div>

      <div>
        {isLoading ? (
          <div className="py-2 flex items-center justify-center">
            <h2 className="text-md font-medium text-primary">Đang tìm kiếm</h2>
            <LoadingDots />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-0">
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
