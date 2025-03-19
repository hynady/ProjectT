import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/commons/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/commons/components/accordion";
import { ShowHeader } from "./ShowHeader";
import { TicketItem } from "./TicketItem";
import { ShowInfo } from "../../internal-types/show.type";
import { TicketFormDialog, TicketFormValues } from "./TicketFormDialog";
import { toast } from "@/commons/hooks/use-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DeleteConfirmDialog } from "@/commons/components/data-table/DeleteConfirmDialog";
import { ScrollArea } from "@/commons/components/scroll-area";

interface ShowListProps {
  shows: ShowInfo[];
  onEditShow: (e: React.MouseEvent, showId: string) => void;
  onDeleteShow: (e: React.MouseEvent, showId: string) => void;
  onAddTicket: (showId: string) => void;
  onEditTicket: (ticketId: string) => void;
  onDeleteTicket: (ticketId: string) => void;
}

export const ShowList = ({
  shows,
  onEditShow,
  onDeleteShow,
  onAddTicket,
  onEditTicket,
  onDeleteTicket
}: ShowListProps) => {
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [deleteTicketDialogOpen, setDeleteTicketDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenTicketDialog = (showId: string) => {
    const show = shows.find(s => s.id === showId);
    if (show && show.saleStatus === "ended") {
      toast({
        title: "Không thể thêm vé",
        description: "Không thể thêm vé cho suất diễn đã diễn ra",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedShowId(showId);
    setEditingTicketId(null);
    setTicketDialogOpen(true);
  };

  const handleOpenEditTicketDialog = (ticketId: string) => {
    // Find the ticket and its show
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
        
        setSelectedShowId(show.id);
        setEditingTicketId(ticketId);
        setTicketDialogOpen(true);
        break;
      }
    }
  };

  const handleConfirmDeleteTicket = (ticketId: string) => {
    // Find the ticket and its show
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
        
        setTicketToDelete(ticketId);
        setDeleteTicketDialogOpen(true);
        break;
      }
    }
  };
  
  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onDeleteTicket(ticketToDelete);
      
      setTicketToDelete(null);
      setDeleteTicketDialogOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa vé. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveTicket = (values: TicketFormValues) => {
    if (editingTicketId) {
      onEditTicket(editingTicketId);
    } else if (selectedShowId) {
      onAddTicket(selectedShowId);
    }
    
    // Close the dialog
    setTicketDialogOpen(false);
    setSelectedShowId(null);
    setEditingTicketId(null);
    
    // Show success toast
    toast({
      title: editingTicketId ? "Vé đã được cập nhật" : "Đã thêm vé mới",
      description: `Loại vé: ${values.type}, Giá: ${values.price.toLocaleString('vi-VN')}đ`,
    });
  };

  const getSelectedTicket = () => {
    if (!editingTicketId) return undefined;
    
    for (const show of shows) {
      const ticket = show.tickets.find(t => t.id === editingTicketId);
      if (ticket) {
        return {
          type: ticket.type,
          price: ticket.price,
          availableQuantity: ticket.available
        };
      }
    }
    return undefined;
  };

  const getShowName = (showId: string | null) => {
    if (!showId) return undefined;
    
    const show = shows.find(s => s.id === showId);
    if (!show) return undefined;
    
    return `${format(new Date(show.date), "dd/MM/yyyy", { locale: vi })} - ${show.time}`;
  };

  return (
    <>
      <div className="space-y-3 py-1">
        <Accordion type="multiple" className="w-full">
          {shows.map((show) => {
            const isEnded = show.saleStatus === "ended";
            
            return (
              <AccordionItem 
                key={show.id} 
                value={show.id} 
                className="border rounded-md overflow-hidden shadow-sm bg-card mb-3"
              >
                <AccordionTrigger className="px-4 py-2.5 hover:bg-muted/30 hover:no-underline [&[data-state=open]]:bg-muted/20">
                  <ShowHeader 
                    show={show} 
                    onEdit={onEditShow} 
                    onDelete={onDeleteShow}
                  />
                </AccordionTrigger>
                <AccordionContent className="border-t bg-card/50">
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium flex items-center">
                        <span>Danh sách vé</span>
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          ({show.tickets.length} loại)
                        </span>
                      </h4>
                      {!isEnded && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 h-8"
                          onClick={() => handleOpenTicketDialog(show.id)}
                        >
                          <Plus className="h-3 w-3" /> Thêm vé
                        </Button>
                      )}
                    </div>
                    
                    {isEnded && (
                      <div className="text-xs italic text-muted-foreground mb-3 bg-muted/50 p-2 rounded-sm">
                        Suất diễn đã kết thúc, không thể thêm, sửa, xóa vé.
                      </div>
                    )}
                    
                    {show.tickets.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground border border-dashed rounded-md">
                        <p>Chưa có loại vé nào</p>
                      </div>
                    ) : (
                      <div className={show.tickets.length > 3 ? "h-[320px]" : ""}>
                        <ScrollArea className="h-full max-h-[320px]">
                          <div className="space-y-2 pr-4">
                            {show.tickets.map((ticket) => (
                              <TicketItem 
                                key={ticket.id}
                                ticket={ticket}
                                onEdit={handleOpenEditTicketDialog}
                                onDelete={handleConfirmDeleteTicket}
                                isReadOnly={isEnded}
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Reusable Ticket Form Dialog */}
      <TicketFormDialog
        open={ticketDialogOpen}
        onOpenChange={setTicketDialogOpen}
        onSave={handleSaveTicket}
        showName={getShowName(selectedShowId)}
        initialValues={getSelectedTicket()}
        isEditing={!!editingTicketId}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteTicketDialogOpen}
        onOpenChange={setDeleteTicketDialogOpen}
        onConfirm={handleDeleteTicket}
        title="Xóa loại vé"
        description="Bạn có chắc chắn muốn xóa loại vé này? Hành động này không thể hoàn tác."
        isDeleting={isDeleting}
      />
    </>
  );
};
