import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, Calendar, Search, Filter } from "lucide-react";
import { cn } from "@/commons/lib/utils/utils";
import { organizeService } from "../../services/organize.service";
import { OrganizerOccaUnit } from "../../internal-types/organize.type";
import { ShowResponse } from "../../internal-types/organize.type";
import { Skeleton } from "@/commons/components/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/commons/components/collapsible";
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/commons/components/sidebar";
import { Input } from "@/commons/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/commons/components/select";
import { Button } from "@/commons/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/commons/components/popover";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

interface EventTicketsMenuProps {
  parentPath: string;
}

const EventTicketsMenu = ({ parentPath }: EventTicketsMenuProps) => {
  const [events, setEvents] = useState<OrganizerOccaUnit[]>([]);
  const [showsByEvent, setShowsByEvent] = useState<Record<string, ShowResponse[]>>({});
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Thêm state cho tìm kiếm, lọc và sắp xếp
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("approved");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch events with filter params
  const fetchEvents = useCallback(async (page = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      else setIsLoadingMore(true);
      
      const response = await organizeService.getOccas({
        page,
        size: 10,
        sort: sortField,
        direction: sortDirection,
        status: statusFilter,
        search: searchQuery
      });
      
      if (append) {
        setEvents(prev => [...prev, ...(response.content || [])]);
      } else {
        setEvents(response.content || []);
        
        // Initialize expanded state for each event
        const initialExpandedState: Record<string, boolean> = {};
        response.content?.forEach(event => {
          initialExpandedState[event.id] = false;
        });
        setExpandedEvents(prev => ({
          ...prev,
          ...initialExpandedState
        }));
      }
      
      setCurrentPage(page);
      setHasMore(!response.last);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [sortField, sortDirection, statusFilter, searchQuery]);

  // Search with debounce
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      fetchEvents(0, false);
    }, 300),
    [fetchEvents]
  );

  // Initial fetch
  useEffect(() => {
    fetchEvents(0, false);
  }, [fetchEvents]);

  // Load more events
  const handleShowMore = () => {
    if (isLoadingMore || !hasMore) return;
    fetchEvents(currentPage + 1, true);
  };

  // Handle filter changes
  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    fetchEvents(0, false);
    setShowFilters(false);
  };

  // Handle sort changes
  const handleSortChange = (field: string) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      // Default to desc for new field
      setSortField(field);
      setSortDirection("desc");
    }
    fetchEvents(0, false);
    setShowFilters(false);
  };

  // Fetch shows for an event when it's expanded
  const fetchShowsForEvent = async (eventId: string) => {
    if (showsByEvent[eventId]) return; // Already fetched
    
    try {
      const shows = await organizeService.getShowsByOccaId(eventId);
      setShowsByEvent(prev => ({
        ...prev,
        [eventId]: shows
      }));
    } catch (err) {
      console.error(`Error fetching shows for event ${eventId}:`, err);
    }
  };

  // Handle toggle event expansion
  const toggleEvent = async (eventId: string) => {
    const newExpandedState = !expandedEvents[eventId];
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: newExpandedState
    }));
    
    if (newExpandedState) {
      // Fetch shows when expanding
      await fetchShowsForEvent(eventId);
    }
  };

  // Check if a show item is active
  const isShowActive = (occaId: string, showId: string): boolean => {
    return location.pathname === `${parentPath}/${occaId}/${showId}`;
  };

  if (loading && events.length === 0) {
    return (
      <div className="space-y-2 px-2 py-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Search and Filter Controls */}
      <div className="px-2 space-y-2">
        <div className="relative w-full">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm sự kiện..."
            className="pl-7 h-8 text-xs w-full"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center justify-between gap-1">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-xs flex-1">
                <Filter className="h-3.5 w-3.5" />
                Lọc
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" className="w-56 p-2">
              <div className="space-y-2">
                <div className="font-medium text-xs mb-1">Trạng thái</div>
                <div className="grid grid-cols-1 gap-1">
                  <Button 
                    size="sm" 
                    variant={statusFilter === "approved" ? "default" : "outline"}
                    className="text-xs justify-start h-7" 
                    onClick={() => handleFilterChange("approved")}
                  >
                    Đã duyệt
                  </Button>
                  <Button 
                    size="sm" 
                    variant={statusFilter === "pending" ? "default" : "outline"}
                    className="text-xs justify-start h-7" 
                    onClick={() => handleFilterChange("pending")}
                  >
                    Đang đợi duyệt
                  </Button>
                  <Button 
                    size="sm" 
                    variant={statusFilter === "draft" ? "default" : "outline"}
                    className="text-xs justify-start h-7" 
                    onClick={() => handleFilterChange("draft")}
                  >
                    Bản nháp
                  </Button>
                </div>
                
                <div className="font-medium text-xs mb-1 mt-2">Sắp xếp theo</div>
                <div className="grid grid-cols-1 gap-1">
                  <Button 
                    size="sm" 
                    variant={sortField === "createdAt" ? "default" : "outline"}
                    className="text-xs justify-start h-7 gap-1" 
                    onClick={() => handleSortChange("createdAt")}
                  >
                    Ngày tạo {sortField === "createdAt" && (sortDirection === "desc" ? "↓" : "↑")}
                  </Button>
                  <Button 
                    size="sm" 
                    variant={sortField === "title" ? "default" : "outline"}
                    className="text-xs justify-start h-7 gap-1" 
                    onClick={() => handleSortChange("title")}
                  >
                    Tên sự kiện {sortField === "title" && (sortDirection === "desc" ? "↓" : "↑")}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
            <Select
            value={sortField}
            onValueChange={(value) => {
              setSortField(value);
              fetchEvents(0, false);
            }}
          >
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Ngày tạo {sortField === "createdAt" && (sortDirection === "desc" ? "↓" : "↑")}</SelectItem>
              <SelectItem value="title">Tên sự kiện {sortField === "title" && (sortDirection === "desc" ? "↓" : "↑")}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={sortDirection}
            onValueChange={(value) => {
              setSortDirection(value as "asc" | "desc");
              fetchEvents(0, false);
            }}
          >
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="Thứ tự" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Giảm dần</SelectItem>
              <SelectItem value="asc">Tăng dần</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {error && (
        <div className="px-3 py-2 text-sm text-muted-foreground">
          {error}
        </div>
      )}
      
      {events.length === 0 && !loading ? (
        <div className="px-3 py-2 text-sm text-muted-foreground">
          Không có sự kiện nào
        </div>
      ) : (
        <SidebarMenu>
          {events.map((event) => (
            <SidebarMenuItem key={event.id} className="flex flex-col py-0">
              <Collapsible
                open={expandedEvents[event.id]}
                onOpenChange={() => toggleEvent(event.id)}
                className="w-full"
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex w-full items-center justify-between px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded-md text-sm">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[180px]" title={event.title}>
                        {event.title.length > 50 ? event.title.slice(0, 50) + "..." : event.title}
                      </span>
                    </div>
                    {expandedEvents[event.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-4 pl-2 border-l border-border">
                    {showsByEvent[event.id]?.length ? (
                      showsByEvent[event.id].map((show) => (
                        <div
                          key={show.id}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1 my-1 text-sm rounded-md cursor-pointer",
                            isShowActive(event.id, show.id)
                              ? "bg-secondary text-secondary-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                          onClick={() => navigate(`${parentPath}/${event.id}/${show.id}`)}
                        >
                          <Calendar className="h-4 w-4" />
                          <span className="truncate">
                                {new Date(show.date).toLocaleDateString()} {show.time}
                            </span>
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-xs text-muted-foreground">
                        {showsByEvent[event.id] ? "Không có suất diễn" : "Đang tải..."}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      )}
      
      {hasMore && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs" 
          onClick={handleShowMore} 
          disabled={isLoadingMore}
        >
          {isLoadingMore ? "Đang tải..." : "Xem thêm"}
        </Button>
      )}
    </div>
  );
};

export default EventTicketsMenu;
