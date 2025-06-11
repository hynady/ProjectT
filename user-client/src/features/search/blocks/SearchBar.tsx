import { useNavigate, useSearchParams } from "react-router-dom";
import { Overlay, useOverlay } from "@/commons/blocks/Overlay.tsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearch } from "../hooks/useSearch.tsx";
import { useRecentItems } from "@/features/search/hooks/useRecentItems.tsx";
import { cn } from "@/commons/lib/utils/utils.ts";
import { Flame, Search, ThumbsUp, X } from "lucide-react";
import { Input } from "@/commons/components/input.tsx";
import { RecentSearches } from "../components/RecentSearches.tsx";
import { RecentOccas } from "../components/RecentOccas.tsx";
import { SuggestOccaList } from "./SuggestOccaList.tsx";
import { SearchResults } from "@/features/search/components/SearchResults.tsx";
import { FilterBadges } from "@/features/search/components/FilterBadges.tsx";
import { searchService } from "../services/search.service.ts";
import {
  OccaSearchItemBaseUnit,
  SearchResultUnit,
} from "@/features/search/internal-types/search.type.ts";
import { useDelayedLoading } from "@/features/search/hooks/useDelayedLoading.tsx";
import { useTracking } from "@/features/tracking/index.ts";

export function SearchBar() {
  const navigate = useNavigate();
  const { isOpen, open, close } = useOverlay();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Chỉ giữ lại state cho trending và recommended
  const [trendingOccas, setTrendingOccas] = useState<SearchResultUnit[]>([]);
  const [recommendOccas, setRecommendOccas] = useState<SearchResultUnit[]>([]);
  const [isFetchingOccas, setIsFetchingOccas] = useState(true);

  // Thêm state cho categories và regions
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);

  // Custom hooks
  const { apiResults, isLoading: searchLoading } = useSearch(query);
  const isDelayedLoading = useDelayedLoading(searchLoading);
  const { trackEventClick } = useTracking();

  const {
    recentSearches,
    recentOccas,
    addRecentSearch,
    addRecentOcca,
    removeRecentSearch,
    removeRecentOcca,
  } = useRecentItems();

  // Fetch categories và regions
  useEffect(() => {
    const fetchCategoriesAndRegions = async () => {
      try {
        const [categoriesData, regionsData] = await Promise.all([
          searchService.fetchCategories(),
          searchService.fetchRegions(),
        ]);
        setCategories(categoriesData);
        setRegions(regionsData);
      } catch {
        // console.error('Error fetching categories and regions:', error);
      }
    };

    fetchCategoriesAndRegions();
  }, []);

  // Fetch dữ liệu trending và recommend
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsFetchingOccas(true);
      try {
        const [trendingData, recommendData] = await Promise.all([
          searchService.fetchTrendingData(),
          searchService.fetchRecommendedData(),
        ]);

        setTrendingOccas(trendingData || trendingData);
        setRecommendOccas(recommendData || recommendData);
      } catch {
        // console.error('Lỗi khi tải dữ liệu sự kiện:', error);
      } finally {
        setIsFetchingOccas(false);
      }
    };

    fetchInitialData();
  }, []);

  // Khởi tạo giá trị query từ URL params
  useEffect(() => {
    const keywordFromUrl = searchParams.get("keyword") || "";
    if (inputRef.current) {
      inputRef.current.value = keywordFromUrl;
    }
    setQuery(keywordFromUrl);
  }, [searchParams]);

  // Xử lý thay đổi filter
  const handleFilterChange = useCallback(
    (type: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value === "all") {
        params.delete(type);
      } else {
        params.set(type, value);
      }
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handleSearchSubmit = useCallback(
    (searchQuery: string) => {
      if (!searchQuery) return;
      addRecentSearch(searchQuery);
      close();
      
      // Giữ lại các filter hiện tại từ URL params
      const params = new URLSearchParams(searchParams);
      params.set("keyword", searchQuery);
      
      // Nếu chưa có sortBy và sortOrder, đặt giá trị mặc định
      if (!params.get("sortBy")) {
        params.set("sortBy", "title");
      }
      if (!params.get("sortOrder")) {
        params.set("sortOrder", "desc");
      }
      
      navigate(`/search?${params.toString()}`);
    },
    [addRecentSearch, close, navigate, searchParams]
  );
  const handleNavigation = useCallback(
    (occa?: OccaSearchItemBaseUnit) => {
      if (occa) {
        addRecentOcca(occa);
        trackEventClick(occa.id, "searchBar");
        navigate(`/occas/${occa.id}`);
      } else {
        // Giữ lại các filter hiện tại từ URL params
        const params = new URLSearchParams(searchParams);
        params.set("keyword", query);
        
        // Nếu chưa có sortBy và sortOrder, đặt giá trị mặc định
        if (!params.get("sortBy")) {
          params.set("sortBy", "title");
        }
        if (!params.get("sortOrder")) {
          params.set("sortOrder", "desc");
        }
        
        navigate(`/search?${params.toString()}`);
      }
      close();
    },
    [query, addRecentOcca, navigate, close, trackEventClick, searchParams]
  );
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query) {
      handleSearchSubmit(query);
    } else if (e.key === "Escape") {
      if (query) {
        // Nếu có text, clear text trước
        handleClear();
      } else {
        // Nếu không có text, đóng search
        close();
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };  return (
    <>
      <div
        className={cn(
          "relative",
          isOpen &&
            "z-50 absolute left-0 right-0 top-4 mx-auto w-[95vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-3xl"
        )}
      >        <Input
          ref={inputRef}
          placeholder="Tìm kiếm sự kiện..."
          className="pl-10 pr-12 md:pr-28 h-11 rounded-full border border-input bg-background"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => open()}
          onKeyUp={handleKeyPress}
        />
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          {/* Filter badges bên trong input - ẩn trên màn hình nhỏ */}
        <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 items-center">
          <FilterBadges
            categories={categories}
            regions={regions}
            onFilterChange={handleFilterChange}
          />
        </div>
        
        {query ? (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            type="button"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          isOpen && (
            <button
              onClick={close}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none text-sm"
              type="button"
              aria-label="Đóng tìm kiếm"
            >
              Đóng
            </button>
          )
        )}
      </div>
      
      <Overlay isVisible={isOpen} onClick={close} />
      {isOpen && (
        <div className={cn(
          "absolute left-0 right-0 top-full mt-2 mx-auto",
          "w-[95vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-3xl",
          "rounded-md border bg-popover text-popover-foreground shadow-md z-50",
          "animate-fade-down animate-duration-[300ms] animate-ease-out"
        )}>
          <div className="max-h-[80vh] overflow-y-auto pt-2">
            {query ? (
              <SearchResults
                query={query}
                results={apiResults} // Chỉ sử dụng kết quả từ API
                isLoading={isDelayedLoading}
                onOccaClick={(occa) => {
                  addRecentSearch(occa.title);
                  handleNavigation(occa);
                }}
                onSearchSubmit={handleSearchSubmit}
              />
            ) : (
              <>
                <RecentSearches
                  searches={recentSearches}
                  onSearchClick={(query) => {
                    setQuery(query);
                    inputRef.current?.focus();
                  }}
                  onRemove={removeRecentSearch}
                />

                <RecentOccas
                  occas={recentOccas}
                  onOccaClick={(id) => {
                    trackEventClick(id, "searchBar");
                    navigate(`/occas/${id}`);
                    close();
                  }}
                  onRemove={removeRecentOcca}
                />

                {isFetchingOccas ? (
                  <div className="p-4 text-center">
                    <span>Đang cập nhật đề xuất...</span>
                  </div>
                ) : (
                  <>
                    <SuggestOccaList
                      title="Sự kiện nổi bật"
                      icon={<Flame className="w-4 h-4" />}
                      occas={trendingOccas.slice(0, 3)}
                      onOccaClick={(occa) => {
                        addRecentSearch(occa.title);
                        handleNavigation(occa);
                      }}
                    />

                    <SuggestOccaList
                      title="Đề xuất cho bạn"
                      icon={<ThumbsUp className="w-4 h-4" />}
                      occas={recommendOccas.slice(0, 3)}
                      onOccaClick={(occa) => {
                        addRecentSearch(occa.title);
                        handleNavigation(occa);
                      }}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
