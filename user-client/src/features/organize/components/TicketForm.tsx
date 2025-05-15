import { useState } from "react";
import { Button } from "@/commons/components/button";
import { ArrowLeft, ArrowRight, Plus, Trash, Ticket } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ShowFormData, TicketFormData } from "../internal-types/organize.type";
import { toast } from "@/commons/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/commons/components/card";
import { Badge } from "@/commons/components/badge";
import { TicketFormDialog, TicketFormValues } from "./shows/TicketFormDialog";

interface TicketFormProps {
  tickets: TicketFormData[];
  shows: ShowFormData[];
  onChange: (tickets: TicketFormData[]) => void;
  onBack: () => void;
  onNext: () => void;
  // Thêm các hàm từ useOccaForm
  createTicket?: (ticket: Omit<TicketFormData, 'id'>) => TicketFormData;
  addTicket?: (ticket: Omit<TicketFormData, 'id'>) => TicketFormData | null;
  updateTicket?: (ticketId: string, ticket: Partial<TicketFormData>) => void;
  deleteTicket?: (ticketId: string) => void;
}

export const TicketForm = ({ 
  tickets, 
  shows, 
  onChange, 
  onBack, 
  onNext,
  createTicket,
  addTicket,
  updateTicket,
  deleteTicket
}: TicketFormProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);

  const openAddTicketDialog = (showId: string) => {
    // Kiểm tra xem show có tồn tại không
    const showExists = shows.some(s => s.id === showId);
    if (!showExists) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm vé: Suất diễn không tồn tại",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedShowId(showId);
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const openEditDialog = (index: number) => {
    const ticket = tickets[index];
    
    // Kiểm tra xem showId có hợp lệ không
    const showExists = shows.some(s => s.id === ticket.showId);
    if (!showExists) {
      toast({
        title: "Lỗi",
        description: "Không thể chỉnh sửa vé: Suất diễn không tồn tại",
        variant: "destructive",
      });
      return;
    }
    
    setEditingIndex(index);
    setSelectedShowId(ticket.showId);
    setDialogOpen(true);
  };

  const handleSaveTicket = (values: TicketFormValues) => {
    if (!selectedShowId) {
      toast({
        title: "Lỗi",
        description: "Không thể xác định suất diễn cho vé này",
        variant: "destructive",
      });
      return;
    }
    
    // Tìm show tương ứng để đảm bảo ID đúng định dạng
    const selectedShow = shows.find(show => show.id === selectedShowId);
    if (!selectedShow) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy suất diễn đã chọn",
        variant: "destructive",
      });
      return;
    }
    
    if (editingIndex !== null) {
      // Cập nhật ticket
      const ticketId = tickets[editingIndex].id;
      if (updateTicket && ticketId) {
        // Sử dụng hàm updateTicket từ useOccaForm nếu có
        updateTicket(ticketId, {
          ...values,
          showId: selectedShowId
        });
      } else {
        // Fallback nếu không có hàm updateTicket
        const updatedTickets = [...tickets];
        updatedTickets[editingIndex] = {
          id: tickets[editingIndex].id,
          showId: selectedShowId,
          ...values
        };
        onChange(updatedTickets);
      }
    } else {
      // Check for duplicate ticket type for the same show
      const isDuplicate = tickets.some(
        ticket => ticket.showId === selectedShowId && ticket.type === values.type
      );

      if (isDuplicate) {
        toast({
          title: "Trùng lặp",
          description: "Loại vé này đã tồn tại cho suất diễn đã chọn",
          variant: "destructive",
        });
        return;
      }

      // Thêm ticket mới
      if (addTicket) {
        // Sử dụng hàm addTicket từ useOccaForm nếu có
        const newTicket = addTicket({
          showId: selectedShowId,
          ...values
        });
        
        // Nếu thêm thất bại (null được trả về), không đóng dialog
        if (!newTicket) return;
      } else if (createTicket) {
        // Tạo ticket mới rồi thêm vào danh sách
        const newTicket = createTicket({
          showId: selectedShowId,
          ...values
        });
        onChange([...tickets, newTicket]);
      } else {
        // Fallback nếu không có hàm addTicket hoặc createTicket
        onChange([...tickets, {
          id: `ticket-${Date.now()}`,
          showId: selectedShowId,
          ...values
        }]);
      }
    }

    setDialogOpen(false);
    setSelectedShowId(null);
    setEditingIndex(null);
  };

  const handleRemoveTicket = (index: number) => {
    const ticketId = tickets[index].id;
    
    if (deleteTicket && ticketId) {
      // Sử dụng hàm deleteTicket từ useOccaForm nếu có
      deleteTicket(ticketId);
    } else {
      // Fallback nếu không có hàm deleteTicket
      const updatedTickets = [...tickets];
      updatedTickets.splice(index, 1);
      onChange(updatedTickets);
    }
  };

  // Group tickets by show ID for display
  const ticketsByShow = tickets.reduce((acc, ticket) => {
    const showId = ticket.showId;
    if (!acc[showId]) {
      acc[showId] = [];
    }
    acc[showId].push(ticket);
    return acc;
  }, {} as Record<string, TicketFormData[]>);

  const getShowDisplayText = (showId: string) => {
    const show = shows.find((s) => s.id === showId);
    if (!show) return "Suất diễn không xác định";
    
    return `${format(new Date(show.date), "dd/MM/yyyy", { locale: vi })} - ${show.time}`;
  };
  
  // Get initial values for edit mode
  const getInitialValues = () => {
    if (editingIndex !== null) {
      const ticket = tickets[editingIndex];
      return {
        type: ticket.type,
        price: ticket.price,
        availableQuantity: ticket.availableQuantity,
      };
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Thêm loại vé</h2>

      {shows.length === 0 ? (
        <div className="border rounded-lg p-8 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground mb-4">
            Bạn cần thêm ít nhất một suất diễn trước khi thêm vé
          </p>
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại thêm suất diễn
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Shows list with tickets - more compact layout */}
          {shows.map((show) => {
            const showTickets = ticketsByShow[show.id || ''] || [];
            return (
              <Card key={show.id} className="shadow-sm">
                <CardHeader className="border-b bg-muted/30 p-3 pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium truncate pr-2">
                      {format(new Date(show.date), "dd/MM/yyyy", { locale: vi })} - {show.time}
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 h-7 text-xs"
                      onClick={() => openAddTicketDialog(show.id || "")}
                    >
                      <Plus className="h-3 w-3" />
                      <span>Thêm vé</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 max-h-[200px] overflow-y-auto">
                  {showTickets.length > 0 ? (
                    <div className="space-y-2">
                      {showTickets.map((ticket, index) => {
                        // Find global index for this ticket
                        const globalIndex = tickets.findIndex(t => t.id === ticket.id);
                        return (
                          <div 
                            key={ticket.id || index} 
                            className="flex items-center justify-between p-2 bg-muted/20 rounded-md text-sm"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Ticket className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="font-medium truncate">{ticket.type}</div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{ticket.price.toLocaleString('vi-VN')}đ</span>
                                  <Badge variant="outline" className="font-normal px-1 py-0 h-4 text-[10px]">
                                    {ticket.availableQuantity} vé
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0 ml-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditDialog(globalIndex)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil w-3.5 h-3.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive h-7 w-7"
                                onClick={() => handleRemoveTicket(globalIndex)}
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Chưa có vé nào cho suất diễn này
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <Button 
          onClick={onNext} 
          className="gap-2"
          disabled={tickets.length === 0}
        >
          Tiếp theo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <TicketFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveTicket}
        showName={selectedShowId ? getShowDisplayText(selectedShowId) : undefined}
        initialValues={getInitialValues()}
        isEditing={editingIndex !== null}
      />
    </div>
  );
};
