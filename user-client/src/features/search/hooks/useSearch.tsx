import {useCallback, useEffect, useState} from "react";
import {OccaSearchItemBaseUnit} from "@/features/search/components/OccaSearchItem.tsx";
import {searchOccasAPI} from "@/features/search/hooks/searchServices.tsx";

// hooks/useSearch.ts
export function useSearch(query: string) {
  // State lưu kết quả từ API và trạng thái loading
  const [apiResults, setApiResults] = useState<OccaSearchItemBaseUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm gọi API tìm kiếm
  const searchApi = useCallback(async () => {
    if (!query) return;

    setIsLoading(true);
    try {
      const results = await searchOccasAPI(query);
      setApiResults(results);
    } catch (error) {
      console.error('Lỗi tìm kiếm API:', error);
      setApiResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  // Debounce tìm kiếm sau 500ms
  useEffect(() => {
    const timer = setTimeout(searchApi, 500);
    return () => clearTimeout(timer);
  }, [query, searchApi]);

  return { apiResults, isLoading };
}