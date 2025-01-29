import { useCallback, useEffect, useState } from "react";
import { searchService } from "@/features/search/services/search.service.ts";
import {OccaSearchItemBaseUnit} from "@/features/search/internal-types/search.type.ts";

export function useSearch(query: string) {
  const [apiResults, setApiResults] = useState<OccaSearchItemBaseUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchApi = useCallback(async () => {
    if (!query) return;

    setIsLoading(true);
    try {
      const results = await searchService.searchOccas(query);
      setApiResults(results);
    } catch (error) {
      console.error('API search error:', error);
      setApiResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(searchApi, 500);
    return () => clearTimeout(timer);
  }, [query, searchApi]);

  return { apiResults, isLoading };
}