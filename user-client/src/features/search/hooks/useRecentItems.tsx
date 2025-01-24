import { RecentOccaUnit } from "../components/RecentOccas.tsx";
import { RecentSearchesUnit } from "../components/RecentSearches.tsx";
import {useCallback} from "react";
import {OccaSearchItemBaseUnit} from "@/features/search/components/OccaSearchItem.tsx";
import {useLocalStorage} from "@/features/search/hooks/useLocalStorage.tsx";

export function useRecentItems() {
  // Quản lý danh sách tìm kiếm gần đây
  const [recentSearches, setRecentSearches] = useLocalStorage<RecentSearchesUnit[]>('recentSearches', []);

  // Quản lý danh sách sự kiện đã xem gần đây
  const [recentOccas, setRecentOccas] = useLocalStorage<RecentOccaUnit[]>('recentOccas', []);

  // Thêm tìm kiếm chuỗi mới
  const addRecentSearch = useCallback((query: string) => {
    const newSearch: RecentSearchesUnit = {
      id: Date.now().toString(),
      query,
      timestamp: new Date()
    };
    setRecentSearches(prev =>
      [newSearch, ...prev.filter(s => s.query !== query)].slice(0, 4)
    );
  }, [setRecentSearches]);

  // Thêm sự kiện mới vào danh sách đã xem
  const addRecentOcca = useCallback((occa: OccaSearchItemBaseUnit) => {
    const newRecentOcca: RecentOccaUnit = {
      ...occa,
      timestamp: new Date()
    };
    setRecentOccas(prev =>
      [newRecentOcca, ...prev.filter(e => e.id !== occa.id)].slice(0, 4)
    );
  }, [setRecentOccas]);

  // Xóa item khỏi danh sách
  const removeRecentSearch = useCallback((id: string) => {
    setRecentSearches(prev => prev.filter(s => s.id !== id));
  }, [setRecentSearches]);

  const removeRecentOcca = useCallback((id: string) => {
    setRecentOccas(prev => prev.filter(s => s.id !== id));
  }, [setRecentOccas]);

  return {
    recentSearches,
    recentOccas,
    addRecentSearch,
    addRecentOcca,
    removeRecentSearch,
    removeRecentOcca
  };
}