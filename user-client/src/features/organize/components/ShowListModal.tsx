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
import { AddShowPayload, AddTicketPayload, UpdateShowPayload } from "../internal-types/show-operations.type";
import { TicketFormValues } from "@/features/organize/components/shows/TicketFormDialog";
import { AuthCodeDialog } from "./auth/AuthCodeDialog";

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
  }>( {
    field: 'date',
    order: 'asc'
  });
  
  const [showDialogOpen, setShowDialogOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<ShowInfo | null>(null);  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showToDelete, setShowToDelete] = useState<ShowInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Auth code dialog states
  const [authCodeDialogOpen, setAuthCodeDialogOpen] = useState(false);
  const [selectedShowForAuth, setSelectedShowForAuth] = useState<ShowInfo | null>(null);
  
  useEffect(() => {
    const fetchShows = async () => {
      if (!open || !occa) return;
      
      setLoading(true);
      setError(null);
        try {
        const result = await organizeService.getShowsByOccaId(occa.id);
        // Transform ShowResponse[] to ShowInfo[] by ensuring autoUpdateStatus has a default value
        const showsWithDefaults = result.map(show => ({
          ...show,
          autoUpdateStatus: show.autoUpdateStatus ?? true // Default to true if not provided
        }));
        setShows(showsWithDefaults);
        setFilteredShows(showsWithDefaults);
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
      
      // Use service to delete the show
      await organizeService.deleteShow(occa.id, showToDelete.id);
      
      // Update local state
      setShows(prevShows => prevShows.filter(show => show.id !== showToDelete.id));
      
      toast({
        title: "Đã xóa suất diễn",
        description: "Suất diễn đã được xóa thành công",
      });
      
      setShowToDelete(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting show:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa suất diễn. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleSaveShow = async (date: string, time: string, status: string, autoUpdateStatus: boolean) => {
    // Check for duplicate show
    try {
      const isDuplicate = shows.some(show => {
        return show.date === date && 
               show.time === time && 
               (!editingShow || show.id !== editingShow.id);
      });

      if (isDuplicate) {
        toast({
          title: "Đã tồn tại",
          description: "Đã có suất diễn vào thời gian này",
          variant: "destructive",
        });
        return;
      }

      if (editingShow) {
        // Chuẩn bị payload theo interface
        const updatePayload: UpdateShowPayload = {
          date,
          time,
          saleStatus: status as ShowSaleStatus,
          autoUpdateStatus
        };
        
        // Update existing show
        await organizeService.updateShow(
          occa.id,
          editingShow.id,
          updatePayload
        );
        
        // Update local state
        setShows(prevShows => prevShows.map(show => 
          show.id === editingShow.id 
            ? { ...show, date, time, saleStatus: status as ShowSaleStatus, autoUpdateStatus } 
            : show
        ));
        
        toast({
          title: "Suất diễn đã được cập nhật",
          description: `Đã cập nhật suất diễn vào ngày ${format(new Date(date), "dd/MM/yyyy")}`,
        });
        
        setEditingShow(null);
      } else {
        // Chuẩn bị payload theo interface
        const addPayload: AddShowPayload = {
          date,
          time,
          saleStatus: status as ShowSaleStatus,
          autoUpdateStatus
        };
        
        // Add new show
        const response = await organizeService.addShow(
          occa.id,
          addPayload
        );
        
        // Add new show to local state
        const newShow: ShowInfo = {
          id: response.id,
          date,
          time,
          saleStatus: status as ShowSaleStatus,
          autoUpdateStatus,
          tickets: []
        };
        
        setShows(prev => [...prev, newShow]);
        
        toast({
          title: "Đã thêm suất diễn",
          description: `Đã thêm suất diễn vào ngày ${format(new Date(date), "dd/MM/yyyy")}`,
        });
      }
      
      setShowDialogOpen(false);
      
    } catch (error) {
      console.error("Error saving show:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu suất diễn. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddTicket = async (showId: string, values: TicketFormValues) => {
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
    
    try {
      // Check for duplicates
      const isDuplicate = show.tickets.some(ticket => ticket.type === values.type);

      if (isDuplicate) {
        toast({
          title: "Trùng lặp",
          description: "Loại vé này đã tồn tại cho suất diễn này",
          variant: "destructive",
        });
        return;
      }
      
      // Chuẩn bị payload theo interface
      const addTicketPayload: AddTicketPayload = {
        type: values.type,
        price: values.price,
        availableQuantity: values.availableQuantity
      };
      
      // Use service to add ticket
      const response = await organizeService.addTicket(
        occa.id,
        showId,
        addTicketPayload
      );
      
      // Update local state
      setShows(prevShows => 
        prevShows.map(show => {
          if (show.id === showId) {
            return {
              ...show,
              tickets: [
                ...show.tickets,
                {
                  id: response.id,
                  type: response.type,
                  price: response.price,
                  available: response.available
                }
              ]
            };
          }
          return show;
        })
      );
      
      toast({
        title: "Đã thêm vé mới",
        description: `Loại vé: ${values.type}, Giá: ${values.price.toLocaleString('vi-VN')}đ`,
      });
      
      return true;
    } catch (error) {
      console.error("Error adding ticket:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm vé. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleEditTicket = async (ticketId: string, values: TicketFormValues) => {
    // Find the show that contains this ticket
    let showWithTicket: ShowInfo | undefined;
    let ticket;
    
    for (const show of shows) {
      ticket = show.tickets.find(t => t.id === ticketId);
      if (ticket) {
        showWithTicket = show;
        break;
      }
    }
    
    if (!showWithTicket || !ticket) return false;
    
    if (showWithTicket.saleStatus === "ended") {
      toast({
        title: "Không thể chỉnh sửa",
        description: "Không thể chỉnh sửa vé của suất diễn đã diễn ra",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Check for duplicates but exclude the current ticket
      const isDuplicate = showWithTicket.tickets.some(t => 
        t.id !== ticketId && t.type === values.type
      );

      if (isDuplicate) {
        toast({
          title: "Trùng lặp",
          description: "Loại vé này đã tồn tại cho suất diễn này",
          variant: "destructive",
        });
        return false;
      }
      
      // Use service to update ticket
      await organizeService.updateTicket(
        occa.id,
        showWithTicket.id,
        ticketId,
        {
          type: values.type,
          price: values.price,
          availableQuantity: values.availableQuantity
        }
      );
      
      // Update local state
      setShows(prevShows => 
        prevShows.map(show => {
          if (show.id === showWithTicket?.id) {
            return {
              ...show,
              tickets: show.tickets.map(t => 
                t.id === ticketId 
                  ? {
                      ...t,
                      type: values.type,
                      price: values.price,
                      available: values.availableQuantity
                    }
                  : t
              )
            };
          }
          return show;
        })
      );
      
      toast({
        title: "Vé đã được cập nhật",
        description: `Loại vé: ${values.type}, Giá: ${values.price.toLocaleString('vi-VN')}đ`,
      });
      
      return true;
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật vé. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleDeleteTicket = async (ticketId: string) => {
    if (!ticketId) return;
    
    // Find the show that contains this ticket
    let showWithTicket: ShowInfo | undefined;
    let ticket;
    
    for (const show of shows) {
      ticket = show.tickets.find(t => t.id === ticketId);
      if (ticket) {
        showWithTicket = show;
        break;
      }
    }
    
    if (!showWithTicket || !ticket) return;
    
    if (showWithTicket.saleStatus === "ended") {
      toast({
        title: "Không thể xóa",
        description: "Không thể xóa vé của suất diễn đã diễn ra",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // Use service to delete ticket
      await organizeService.deleteTicket(
        occa.id,
        showWithTicket.id,
        ticketId
      );
      
      // Update local state
      setShows(prevShows => 
        prevShows.map(show => {
          if (show.id === showWithTicket?.id) {
            return {
              ...show,
              tickets: show.tickets.filter(t => t.id !== ticketId)
            };
          }
          return show;
        })
      );
      
      toast({
        title: "Đã xóa vé",
        description: "Vé đã được xóa thành công",
      });
      
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa vé. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
  const handleOpenAuthCodeDialog = (e: React.MouseEvent, showId: string) => {
    e.stopPropagation();
    const show = shows.find(s => s.id === showId);
    if (show) {
      setSelectedShowForAuth(show);
      setAuthCodeDialogOpen(true);
    }
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
              ) : (                <ShowList
                  shows={filteredShows}
                  onEditShow={handleEditShow}
                  onDeleteShow={handleConfirmDeleteShow}
                  onAddTicket={(showId, values) => handleAddTicket(showId, values)}
                  onEditTicket={(ticketId, values) => handleEditTicket(ticketId, values)}
                  onDeleteTicket={handleDeleteTicket}
                  onGetAuthCode={handleOpenAuthCodeDialog}
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
        showData={editingShow}      />
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteShow}
        title="Xóa suất diễn"
        description={`Bạn có chắc chắn muốn xóa suất diễn vào ngày ${showToDelete ? format(new Date(showToDelete.date), "dd/MM/yyyy") : ""} lúc ${showToDelete?.time || ""}? Hành động này không thể hoàn tác.`}
        isDeleting={isDeleting}
      />

      {/* Auth Code Dialog */}
      {selectedShowForAuth && (
        <AuthCodeDialog
          open={authCodeDialogOpen}
          onOpenChange={setAuthCodeDialogOpen}
          showId={selectedShowForAuth.id}
          showName={`${format(new Date(selectedShowForAuth.date), "dd/MM/yyyy")} - ${selectedShowForAuth.time}`}
        />
      )}
    </>
  );
};
