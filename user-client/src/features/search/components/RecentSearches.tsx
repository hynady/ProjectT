// components/search/RecentSearches.tsx
import React from 'react';
import { Clock, X } from 'lucide-react';

export interface RecentSearchesUnit {
  id: string;
  query: string;
  timestamp: Date;
}
interface RecentSearchesProps {
  searches: RecentSearchesUnit[];
  onSearchClick: (query: string) => void;
  onRemove: (id: string) => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
                                                                searches,
                                                                onSearchClick,
                                                                onRemove,
                                                              }) => {
  if (searches.length === 0) return null;

  return (
    <div className="pl-4 p-2">
      <h3 className="flex items-center gap-2 font-medium mb-2">
        <Clock className="w-4 h-4"/>
        Tìm kiếm gần đây
      </h3>
      <div className="space-y-2">
        {searches.map((search, index) => (
          <div
            key={`recent-search-${search.id}-${index}`}
            className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
          >
            <span
              className="cursor-pointer w-full"
              onClick={() => onSearchClick(search.query)}
            >
              {search.query}
            </span>
            <button
              onClick={() => onRemove(search.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4"/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};