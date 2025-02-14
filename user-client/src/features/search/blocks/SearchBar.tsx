import {useNavigate, useSearchParams} from "react-router-dom";
import {Overlay, useOverlay} from "@/commons/blocks/Overlay.tsx";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useSearch} from "../hooks/useSearch.tsx";
import {useRecentItems} from "@/features/search/hooks/useRecentItems.tsx";
import {cn} from "@/commons/lib/utils/utils.ts";
import {Flame, Search, ThumbsUp, X} from "lucide-react";
import {Input} from "@/commons/components/input.tsx";
import {RecentSearches} from "../components/RecentSearches.tsx";
import {RecentOccas} from "../components/RecentOccas.tsx";
import {SuggestOccaList} from "./SuggestOccaList.tsx";
import {SearchResults} from "@/features/search/components/SearchResults.tsx";
import { searchService } from "../services/search.service.ts";
import {OccaSearchItemBaseUnit, SearchResultUnit} from "@/features/search/internal-types/search.type.ts";
import { useDelayedLoading } from "@/features/search/hooks/useDelayedLoading.tsx";

export function SearchBar() {
  const navigate = useNavigate();
  const {isOpen, open, close} = useOverlay();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();

  // Chỉ giữ lại state cho trending và recommended
  const [trendingOccas, setTrendingOccas] = useState<SearchResultUnit[]>([]);
  const [recommendOccas, setRecommendOccas] = useState<SearchResultUnit[]>([]);
  const [isFetchingOccas, setIsFetchingOccas] = useState(true);

  // Custom hooks
  const {apiResults, isLoading: searchLoading} = useSearch(query);
  const isDelayedLoading = useDelayedLoading(searchLoading);

  const {
    recentSearches,
    recentOccas,
    addRecentSearch,
    addRecentOcca,
    removeRecentSearch,
    removeRecentOcca
  } = useRecentItems();

  // Fetch dữ liệu trending và recommend
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsFetchingOccas(true);
      try {
        const [trendingData, recommendData] = await Promise.all([
          searchService.fetchTrendingData(),
          searchService.fetchRecommendedData()
        ]);

        setTrendingOccas(trendingData || trendingData);
        setRecommendOccas(recommendData || recommendData);
      } catch (error) {
        // console.error('Lỗi khi tải dữ liệu sự kiện:', error);
      } finally {
        setIsFetchingOccas(false);
      }
    };

    fetchInitialData();
  }, []);

  // Khởi tạo giá trị query từ URL params
  useEffect(() => {
    const keywordFromUrl = searchParams.get('keyword') || '';
    if (inputRef.current) {
      inputRef.current.value = keywordFromUrl;
    }
    setQuery(keywordFromUrl);
  }, [searchParams]);

  const handleSearchSubmit = useCallback((searchQuery: string) => {
    if (!searchQuery) return;
    addRecentSearch(searchQuery);
    close();
    navigate(`/search?keyword=${encodeURIComponent(searchQuery)}&sortBy=title&sortOrder=desc`);
  }, [addRecentSearch, close, navigate]);

  const handleNavigation = useCallback((occa?: OccaSearchItemBaseUnit) => {
    if (occa) {
      addRecentOcca(occa);
      navigate(`/occas/${occa.id}`);
    } else {
      navigate(`/search?keyword=${encodeURIComponent(query)}&sortBy=title&sortOrder=desc`);
    }
    close();
  }, [query, addRecentOcca, navigate, close]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query) {
      handleSearchSubmit(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <>
      <div className={cn("relative",
        isOpen &&
        "z-50 absolute left-0 right-0 top-4 mx-auto w-[95vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-3xl")}>
        <Input
          ref={inputRef}
          placeholder="Tìm kiếm sự kiện..."
          className="pl-10 pr-9 h-11 rounded-full border border-input bg-background" // Thêm pr-9 để tránh text bị đè bởi nút clear
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => open()}
          onKeyUp={handleKeyPress}
        />
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            type="button"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Overlay isVisible={isOpen} onClick={close}/>

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
                      icon={<Flame className="w-4 h-4"/>}
                      occas={trendingOccas.slice(0, 3)}
                      onOccaClick={(occa) => {
                        addRecentSearch(occa.title);
                        handleNavigation(occa);
                      }}
                    />

                    <SuggestOccaList
                      title="Đề xuất cho bạn"
                      icon={<ThumbsUp className="w-4 h-4"/>}
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