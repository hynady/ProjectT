import {Search, Clock, Ticket, X, ArrowRight, Flame, ThumbsUp} from "lucide-react"
import {Input} from "@/components/ui/input"
import {cn} from "@/lib/utils"
import {mockSections} from "@/services/mockData.tsx"
import {useEffect, useMemo, useRef, useState} from "react"
import {useNavigate, useSearchParams} from "react-router-dom";
import {EventData} from "@/types";

interface RecentSearch {
  id: string;
  query: string;
  timestamp: Date;
}

interface RecentEventData extends EventData {
  timestamp: Date;
}

// Mock API function for fuzzy search
const searchEventsAPI = async (query: string): Promise<EventData[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock fuzzy search logic
  // In a real application, this would be an actual API call
  if (query.toLowerCase().includes('fest')) {
    return [
      {
        id: 'api-1',
        title: `Similar to "${query}" - Event 1`,
        image: '/',
        date: '2025-01-15',
        categoryId: "1",
        venueId: "1",
        time: "20:00",
        location: 'Location A',
        price: '200.000 VND'
      },
      {
        id: 'api-2',
        title: `Similar to "${query}" - Event 2`,
        image: '/',
        date: '2025-01-20',
        categoryId: "1",
        venueId: "1",
        time: "20:00",
        location: 'Location B',
        price: '300.000 VND'
      }
    ];
  }
  return [];
};

export function SearchBar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [apiResults, setApiResults] = useState<EventData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchParams] = useSearchParams();

  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentSearches')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  // Recent events searches state
  const [recentEvents, setRecentEvents] = useState<RecentEventData[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentEvents')
      return saved ? JSON.parse(saved) : []
    }
    return []
  });

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    if (!query) return []

    const allEvents = mockSections.flatMap(section => section.events)
    return allEvents.filter(event =>
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.location.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  // Handle API search
  const handleApiSearch = async () => {
    if (!query || filteredEvents.length > 0) return;

    setIsLoading(true);
    try {
      const results = await searchEventsAPI(query);
      console.error('1');

      setApiResults(results);
    } catch (error) {
      console.error('Search API error:', error);
      setApiResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  //Replace search input value key in param
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = searchParams.get('keyword') || '';
    }
  }, []);

  // Debounced API search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleApiSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle search submission
  const handleSearchSubmit = (searchQuery: string) => {
    addToRecentSearches(searchQuery);
    setIsOpen(false);
    navigate(`/search?keyword=${encodeURIComponent(searchQuery)}&sortBy=title&sortOrder=desc`);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query) {
      handleSearchSubmit(query);
    }
  };

  // Add search to recent searches
  const addToRecentSearches = (searchQuery: string) => {
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query: searchQuery,
      timestamp: new Date()
    }

    const updated = [newSearch, ...recentSearches.filter(s => s.query !== searchQuery)]
      .slice(0, 4)

    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const addToRecentEvents = (event: EventData) => {
    const newRecentEvent: RecentEventData = {
      ...event,
      timestamp: new Date()
    }

    const updated = [newRecentEvent, ...recentEvents.filter(e => e.id !== event.id)]
      .slice(0, 4)

    setRecentEvents(updated)
    localStorage.setItem('recentEvents', JSON.stringify(updated))
  }

  // Remove from recent searches
  const removeFromRecentSearches = (id: string) => {
    const updated = recentSearches.filter(s => s.id !== id)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const removeFromRecentEvent = (id: string) => {
    const updated = recentEvents.filter(s => s.id !== id)
    setRecentEvents(updated)
    localStorage.setItem('recentEvents', JSON.stringify(updated))
  }


  const handleNavigation = (event?: EventData) => {
    if (event) {
      // Nếu có event cụ thể, thêm vào recent events và điều hướng đến trang chi tiết
      addToRecentEvents(event);
      navigate(`/events/${event.id}`);
    } else {
      // Nếu không có event cụ thể, điều hướng đến trang tìm kiếm
      navigate(`/search?keyword=${encodeURIComponent(query)}&sortBy=title&sortOrder=desc`);
    }
    setIsOpen(false);
  };

  return (
    <>
      <div className={cn("relative",
        isOpen &&
        "z-50 absolute left-0 right-0 top-4 mx-auto w-[95vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-3xl")}>
        <Input
          ref={inputRef}
          placeholder="Tìm kiếm sự kiện..."
          className="pl-10 pr-4 h-11 rounded-full border border-input bg-background "
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyUp={handleKeyPress}
        />
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>

      {isOpen && (
        <>
          {/* Overlay*/}
          <div
            className={cn(
              "fixed inset-0 z-40 h-full",
              "backdrop-blur-sm bg-black/10",
              "animate-fade animate-duration-200",
              "supports-[backdrop-filter]:bg-black/60"      // Fallback cho trình duyệt không hỗ trợ backdrop-filter
            )}
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown content */}
          <div className={cn(
            // Thay đổi positioning để căn giữa màn hình
            "absolute left-0 right-0 top-full mt-2 mx-auto",
            // Responsive width
            "w-[95vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-3xl",
            // Styling cơ bản
            "rounded-md border bg-popover text-popover-foreground shadow-md z-50",
            // Animation khi xuất hiện
            "animate-fade-down animate-duration-[300ms] animate-ease-out"
          )}>
            <div className="max-h-[80vh] overflow-y-auto pt-2">

              {/* Recent Searches */}
              {recentSearches.length > 0 && !query && (
                <div className="pl-4 p-2">
                  <h3 className="flex items-center gap-2 font-medium mb-2">
                    <Clock className="w-4 h-4"/>
                    Tìm kiếm gần đây
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <div
                        key={`recent-search-${search.id}-${index}`}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                      >
                        <span
                          className="cursor-pointer w-full"
                          onClick={() => {
                            setQuery(search.query);
                            inputRef.current?.focus();
                          }}
                        >
                          {search.query}
                        </span>
                        <button
                          onClick={() => removeFromRecentSearches(search.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4"/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Events */}
              {recentEvents.length > 0 && !query && (
                <div className="pl-4 p-2">
                  <h3 className="flex items-center gap-2 font-medium mb-2">
                    <Ticket className="w-4 h-4"/>
                    Event đã xem gần đây
                  </h3>
                  <div className="space-y-2">
                    {recentEvents.map((recentEvent, index) => (
                      <div
                        key={`recent-event-${recentEvent.id}-${index}`}
                        className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
                      >
                        <div
                          className="w-full"
                          onClick={() => {
                            navigate(`/events/${recentEvent.id}`);
                            setIsOpen(false);
                          }}>
                          <p className="font-medium">{recentEvent.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {recentEvent.date} • {recentEvent.location}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromRecentEvent(recentEvent.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4"/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Events */}
              {!query && (
                <>
                  {/* Trending Events */}
                  <div className="pl-4 p-2">
                    <h3 className="flex items-center gap-2 font-medium mb-2">
                      <Flame className="w-4 h-4"/>
                      Sự kiện nổi bật
                    </h3>
                    <div className="space-y-2">
                      {mockSections[0].events.slice(0, 3).map((event, index) => (
                        <div
                          key={`featured-${event.id}-${index}`}
                          className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
                          onClick={() => {
                            addToRecentSearches(event.title);
                            handleNavigation(event); // Truyền event để điều hướng đến trang chi tiết
                          }}
                        >
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.date} • {event.location}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggest Events */}
                  <div className="pl-4 p-2">
                    <h3 className="flex items-center gap-2 font-medium mb-2">
                      <ThumbsUp className="w-4 h-4"/>
                      Đề xuất cho bạn
                    </h3>
                    <div className="space-y-2">
                      {mockSections[1].events.slice(0, 3).map((event, index) => (
                        <div
                          key={`top-${event.id}-${index}`}
                          className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
                          onClick={() => {
                            addToRecentSearches(event.title);
                            handleNavigation(event); // Truyền event để điều hướng đến trang chi tiết
                          }}
                        >
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.date} • {event.location}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Search Results from mockSections */}
              {query && filteredEvents.length > 0 && (
                <div className="pl-4 p-2">
                  <h3 className="font-medium mb-2">Kết quả tìm kiếm</h3>

                  {/* Phần 1: Sự kiện tìm kiếm */}
                  <div className="space-y-2">
                    {filteredEvents.map((event, index) => (
                      <div
                        key={`search-${event.id}-${index}`}
                        className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
                        onClick={() => {
                          addToRecentSearches(event.title);
                          handleNavigation(event); // Truyền event để điều hướng đến trang chi tiết
                        }}
                      >
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.date} • {event.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Phần 2: Từ khóa tìm kiếm */}
                  <div
                    className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer border text-primary"
                    onClick={() => handleSearchSubmit(query)}
                  >
                    Tìm kiếm với từ khóa "{query}"
                    <ArrowRight className="w-4 h-4"/>
                  </div>
                </div>
              )}

              {/* API Search Results */}
              {query && filteredEvents.length === 0 && (
                <div className="pl-4 p-2">
                  <h3 className="font-medium mb-2">Kết quả tìm kiếm</h3>

                  {/* Phần 1: Kết quả tìm kiếm */}
                  <div>
                    {isLoading ? (
                      <div className="text-center py-2">Đang tìm kiếm...</div>
                    ) : apiResults.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-medium mb-2">Sự kiện</h4>
                        {apiResults.map((event, index) => (
                          <div
                            key={`api-${event.id}-${index}`}
                            className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
                            onClick={() => {
                              handleNavigation(event);
                            }}
                          >
                            <div>
                              <p className="font-medium">{event.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {event.date} • {event.location}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-muted-foreground">
                        Không tìm thấy sự kiện cụ thể nào
                      </div>
                    )}
                  </div>

                  {/* Phần 2: Từ khóa tìm kiếm */}
                  <div
                    className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => handleSearchSubmit(query)}
                  >
                    Tìm kiếm với từ khóa "{query}"
                    <ArrowRight className="w-4 h-4"/>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}