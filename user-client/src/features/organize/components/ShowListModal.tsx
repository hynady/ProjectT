import { useEffect, useState } from "react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { Plus } from "lucide-react";
import { DateRange } from "react-day-picker";
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
import { ShowFormDialog } from "./shows/ShowFormDialog";
import { DeleteConfirmDialog } from "@/commons/components/data-table/DeleteConfirmDialog";
import { vi } from "date-fns/locale";

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedStatuses, setSelectedStatuses] = useState<ShowSaleStatus[]>([]);
  const [sortOption, setSortOption] = useState<{
    field: 'date' | 'time';
    order: 'asc' | 'desc';
  }>({
    field: 'date',
    order: 'asc'
  });
  
  const [showDialogOpen, setShowDialogOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<ShowInfo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showToDelete, setShowToDelete] = useState<ShowInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const fetchShows = async () => {
      if (!open || !occa) return;
      
      setLoading(true);
      setError(null);
      
      try {
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

  useEffect(() => {
    if (!shows.length) return;
    
    let result = [...shows];

    if (dateRange?.from) {
      result = result.filter(show => {
        const showDate = parseISO(show.date);
        if (dateRange.to && dateRange.from) {
          return isWithinInterval(showDate, {
            start: dateRange.from,
            end: dateRange.to
          });
        }
        return format(showDate, 'yyyy-MM-dd') === format(dateRange.from!, 'yyyy-MM-dd');
      });
    }

    if (selectedStatuses.length > 0) {
      result = result.filter(show => selectedStatuses.includes(show.saleStatus));
    }

    result.sort((a, b) => {
      if (sortOption.field === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOption.order === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const timeA = a.time;
        const timeB = b.time;
        return sortOption.order === 'asc' ? 
          timeA.localeCompare(timeB) : 
          timeB.localeCompare(timeA);
      }
    });

    setFilteredShows(result);
  }, [shows, dateRange, selectedStatuses, sortOption]);

  const handleAddShow = () => {
    setEditingShow(null);
    setShowDialogOpen(true);
  };
  
  const handleEditShow = (e: React.MouseEvent, showId: string) => {
    e.stopPropagation();
    const show = shows.find(s => s.id === showId);
    if (show) {
      if (show.saleStatus === "ended") {
        toast({
          title: "Không thể chỉnh sửa",
          description: "Không thể chỉnh sửa suất diễn đã diễn ra",
          variant: "destructive",
        });
        return;
      }
      
      setEditingShow(show);
      setShowDialogOpen(true);
    }
  };
  
  const handleConfirmDeleteShow = (e: React.MouseEvent, showId: string) => {
    e.stopPropagation();
    const show = shows.find(s => s.id === showId);
    if (show) {
      if (show.saleStatus === "ended") {
        toast({
          title: "Không thể xóa",
          description: "Không thể xóa suất diễn đã diễn ra",
          variant: "destructive",
        });
        return;
      }
      
      setShowToDelete(show);
      setDeleteDialogOpen(true);
    }
  };
  
  const handleDeleteShow = async () => {
    if (!showToDelete) return;
    
    try {
      setIsDeleting(true);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setShows(prevShows => prevShows.filter(show => show.id !== showToDelete.id));
      
      toast({
        title: "Đã xóa suất diễn",
        description: "Suất diễn đã được xóa thành công",
      });
      
      setShowToDelete(null);
      setDeleteDialogOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa suất diễn. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleSaveShow = (date: string, time: string) => {
    try {
      const isDuplicate = shows.some(show => {
        if (editingShow && show.id === editingShow.id) return false;
        return show.date === date && show.time === time;
      });

      if (isDuplicate) {
        toast({
          title: "Trùng lặp",
          description: "Đã có suất diễn vào ngày và giờ này",
          variant: "destructive",
        });
        return;
      }

      if (editingShow) {
        const updatedShows = shows.map(show => {
          if (show.id === editingShow.id) {
            return {
              ...show,
              date,
              time,
            };
          }
          return show;
        });
        
        setShows(updatedShows);
        toast({
          title: "Suất diễn đã được cập nhật",
          description: `Đã cập nhật suất diễn vào ngày ${format(new Date(date), "dd/MM/yyyy")}`,
        });
      } else {
        const newShow: ShowInfo = {
          id: `show-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date,
          time,
          saleStatus: "upcoming",
          tickets: []
        };
        
        setShows(prev => [...prev, newShow]);
        toast({
          title: "Đã thêm suất diễn",
          description: `Đã thêm suất diễn vào ngày ${format(new Date(date), "dd/MM/yyyy")}`,
        });
      }
      
      setShowDialogOpen(false);
      
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu suất diễn. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddTicket = (showId: string) => {
    const show = shows.find(s => s.id === showId);
    if (!show) return;
    
    if (show.saleStatus === "ended") {
      toast({
        title: "Không thể thêm vé",
        description: "Không thể thêm vé cho suất diễn đã diễn ra",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Thêm loại vé mới",
      description: `Đang thêm vé cho suất diễn ${showId}`,
    });
  };
  
  const handleEditTicket = (ticketId: string) => {
    for (const show of shows) {
      const ticket = show.tickets.find(t => t.id === ticketId);
      if (ticket) {
        if (show.saleStatus === "ended") {
          toast({
            title: "Không thể chỉnh sửa",
            description: "Không thể chỉnh sửa vé của suất diễn đã diễn ra",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Chỉnh sửa loại vé",
          description: `Đang chỉnh sửa vé ${ticketId}`,
        });
        return;
      }
    }
  };
  
  const handleDeleteTicket = (ticketId: string) => {
    for (const show of shows) {
      const ticket = show.tickets.find(t => t.id === ticketId);
      if (ticket) {
        if (show.saleStatus === "ended") {
          toast({
            title: "Không thể xóa",
            description: "Không thể xóa vé của suất diễn đã diễn ra",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Xóa loại vé",
          description: `Đang xóa vé ${ticketId}`,
          variant: "destructive",
        });
        return;
      }
    }
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
    setDateRange(undefined);
    setSelectedStatuses([]);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleClearDateRange = () => {
    setDateRange(undefined);
  };

  const isFiltered = !!dateRange || selectedStatuses.length > 0;

  return (
    <>
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
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            selectedStatuses={selectedStatuses}
            onStatusToggle={handleStatusToggle}
            onClearStatusFilters={() => setSelectedStatuses([])}
            sortOption={sortOption}
            onSortChange={handleSortChange}
            onClearDateRange={handleClearDateRange}
          />

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(85vh-160px)] w-full px-6">
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
                  onDeleteShow={handleConfirmDeleteShow}
                  onAddTicket={handleAddTicket}
                  onEditTicket={handleEditTicket}
                  onDeleteTicket={handleDeleteTicket}
                />
              )}
            </ScrollArea>
          </div>

          {isFiltered && shows.length > 0 && (
            <div className="px-6 py-2 text-sm text-muted-foreground border-t">
              {filteredShows.length === 0 
                ? "Không tìm thấy suất diễn nào" 
                : `Hiển thị ${filteredShows.length} / ${shows.length} suất diễn`}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <ShowFormDialog
        open={showDialogOpen}
        onOpenChange={setShowDialogOpen}
        onSave={handleSaveShow}
        editingShow={editingShow ? { date: editingShow.date, time: editingShow.time } : undefined}
      />
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteShow}
        title="Xóa suất diễn"
        description={`Bạn có chắc chắn muốn xóa suất diễn vào ngày ${showToDelete ? format(new Date(showToDelete.date), "dd/MM/yyyy", { locale: vi }) : ""} lúc ${showToDelete?.time || ""}? Hành động này không thể hoàn tác.`}
        isDeleting={isDeleting}
      />
    </>
  );
};
