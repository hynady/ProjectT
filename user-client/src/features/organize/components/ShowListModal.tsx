import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/commons/components/dialog";
import { OrganizerOccaUnit, ShowSaleStatus } from "../internal-types/organize.type";
import { organizeService } from "../services/organize.service";
import { Button } from "@/commons/components/button";
import { ScrollArea } from "@/commons/components/scroll-area";
import { toast } from "@/commons/hooks/use-toast";
import { ShowInfo } from "../internal-types/show.type";
import { FilterControls } from "./shows/FilterControls";
import { LoadingSkeleton } from "./shows/LoadingSkeleton";
import { EmptyState } from "./shows/EmptyState";
import { ShowList } from "./shows/ShowList";

interface ShowListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  occa: OrganizerOccaUnit;
}

export const ShowListModal = ({ open, onOpenChange, occa }: ShowListModalProps) => {
  const [shows, setShows] = useState<ShowInfo[]>([]);
  const [filteredShows, setFilteredShows] = useState<ShowInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ShowSaleStatus[]>([]);
  const [sortOption, setSortOption] = useState<{
    field: 'date' | 'time';
    order: 'asc' | 'desc';
  }>({
    field: 'date',
    order: 'asc'
  });
  
  useEffect(() => {
    const fetchShows = async () => {
      if (!open || !occa) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Call the service function to get shows data
        const result = await organizeService.getShowsByOccaId(occa.id);
        setShows(result);
        setFilteredShows(result);
      } catch (err) {
        console.error("Error fetching shows:", err);
        setError("Không thể tải danh sách suất diễn. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [open, occa]);

  // Apply filters and sorting
  useEffect(() => {
    if (!shows.length) return;
    
    // Apply filters and sorting logic
    // ...existing filtering and sorting code...
  }, [shows, searchQuery, selectedStatuses, sortOption]);

  const handleAddShow = () => {
    toast({
      title: "Thêm suất diễn mới",
      description: "Đang thêm suất diễn mới cho sự kiện này",
    });
  };
  
  const handleEditShow = (e: React.MouseEvent, showId: string) => {
    e.stopPropagation();
    toast({
      title: "Chỉnh sửa suất diễn",
      description: `Đang chỉnh sửa suất diễn ${showId}`,
    });
  };
  
  const handleDeleteShow = (e: React.MouseEvent, showId: string) => {
    e.stopPropagation();
    toast({
      title: "Xóa suất diễn",
      description: `Đang xóa suất diễn ${showId}`,
      variant: "destructive",
    });
  };
  
  const handleAddTicket = (showId: string) => {
    toast({
      title: "Thêm loại vé mới",
      description: `Đang thêm vé cho suất diễn ${showId}`,
    });
  };
  
  const handleEditTicket = (ticketId: string) => {
    toast({
      title: "Chỉnh sửa loại vé",
      description: `Đang chỉnh sửa vé ${ticketId}`,
    });
  };
  
  const handleDeleteTicket = (ticketId: string) => {
    toast({
      title: "Xóa loại vé",
      description: `Đang xóa vé ${ticketId}`,
      variant: "destructive",
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusToggle = (status: ShowSaleStatus) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleSortChange = (field: 'date' | 'time', order: 'asc' | 'desc') => {
    setSortOption({ field, order });
  };
  
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedStatuses([]);
  };

  const isFiltered = searchQuery.trim() !== '' || selectedStatuses.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex text-start items-center justify-between m-3 mb-0">
            <DialogTitle className="text-xl">
              Suất diễn: {occa.title}
            </DialogTitle>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-1"
              onClick={handleAddShow}
            >
              <Plus className="h-4 w-4" /> Thêm suất diễn
            </Button>
          </div>
        </DialogHeader>

        <FilterControls
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedStatuses={selectedStatuses}
          onStatusToggle={handleStatusToggle}
          onClearStatusFilters={() => setSelectedStatuses([])}
          sortOption={sortOption}
          onSortChange={handleSortChange}
        />

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(85vh-160px)] w-full pr-4">
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-destructive">{error}</p>
              </div>
            ) : filteredShows.length === 0 ? (
              <EmptyState 
                isFiltered={shows.length > 0}
                onAddShow={handleAddShow}
                onClearFilters={handleClearFilters}
              />
            ) : (
              <ShowList
                shows={filteredShows}
                onEditShow={handleEditShow}
                onDeleteShow={handleDeleteShow}
                onAddTicket={handleAddTicket}
                onEditTicket={handleEditTicket}
                onDeleteTicket={handleDeleteTicket}
              />
            )}
          </ScrollArea>
        </div>

        {/* Show result count when filters are applied */}
        {isFiltered && shows.length > 0 && (
          <div className="px-6 py-2 text-sm text-muted-foreground border-t">
            {filteredShows.length === 0 
              ? "Không tìm thấy suất diễn nào" 
              : `Hiển thị ${filteredShows.length} / ${shows.length} suất diễn`}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
