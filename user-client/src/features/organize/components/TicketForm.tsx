import { useState } from "react";
import { Button } from "@/commons/components/button";
import { Input } from "@/commons/components/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/commons/components/select";
import { ArrowLeft, ArrowRight, Plus, Trash } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/commons/components/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/commons/components/form";
import { ShowFormData, TicketFormData } from "../internal-types/organize.type";
import { toast } from "@/commons/hooks/use-toast";

interface TicketFormProps {
  tickets: TicketFormData[];
  shows: ShowFormData[];
  onChange: (tickets: TicketFormData[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const ticketSchema = z.object({
  showId: z.string({
    required_error: "Vui lòng chọn suất diễn",
  }),
  type: z.string({
    required_error: "Vui lòng nhập loại vé",
  }).min(2, {
    message: "Tên loại vé phải có ít nhất 2 ký tự",
  }),
  price: z.coerce.number({
    required_error: "Vui lòng nhập giá vé",
    invalid_type_error: "Giá vé phải là số",
  }).min(0, {
    message: "Giá vé không thể âm",
  }),
  availableQuantity: z.coerce.number({
    required_error: "Vui lòng nhập số lượng vé",
    invalid_type_error: "Số lượng vé phải là số",
  }).min(1, {
    message: "Số lượng vé phải ít nhất 1",
  }),
});

export const TicketForm = ({ tickets, shows, onChange, onBack, onNext }: TicketFormProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      showId: "",
      type: "",
      price: 0,
      availableQuantity: 1,
    },
  });

  const resetForm = () => {
    form.reset();
    setEditingIndex(null);
  };

  const openEditDialog = (index: number) => {
    const ticket = tickets[index];
    setEditingIndex(index);
    form.reset({
      showId: ticket.showId,
      type: ticket.type,
      price: ticket.price,
      availableQuantity: ticket.availableQuantity,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: TicketFormData) => {
    const newTicket: TicketFormData = {
      id: editingIndex !== null ? tickets[editingIndex].id : `ticket-${Date.now()}`,
      ...values,
    };

    let updatedTickets;
    if (editingIndex !== null) {
      // Edit existing ticket
      updatedTickets = [...tickets];
      updatedTickets[editingIndex] = newTicket;
    } else {
      // Check for duplicate ticket type for the same show
      const isDuplicate = tickets.some(
        ticket => ticket.showId === values.showId && ticket.type === values.type
      );

      if (isDuplicate) {
        toast({
          title: "Trùng lặp",
          description: "Loại vé này đã tồn tại cho suất diễn đã chọn",
          variant: "destructive",
        });
        return;
      }

      updatedTickets = [...tickets, newTicket];
    }

    onChange(updatedTickets);
    setDialogOpen(false);
    resetForm();
  };

  const handleRemoveTicket = (index: number) => {
    const updatedTickets = [...tickets];
    updatedTickets.splice(index, 1);
    onChange(updatedTickets);
  };

  // Group tickets by show for better display
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Thêm loại vé</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm loại vé
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? "Sửa loại vé" : "Thêm loại vé mới"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="showId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suất diễn</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn suất diễn" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shows.map((show) => (
                            <SelectItem key={show.id} value={show.id || ""}>
                              {format(new Date(show.date), "dd/MM/yyyy", { locale: vi })} - {show.time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại vé</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: VIP, Standard, Economy..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá vé (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="VD: 500000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availableQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng vé</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="VD: 100"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Hủy bỏ
                    </Button>
                  </DialogClose>
                  <Button type="submit">
                    {editingIndex !== null ? "Cập nhật" : "Thêm"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {tickets.length === 0 ? (
        <div className="border rounded-lg p-8 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground mb-4">
            Chưa có loại vé nào được thêm vào
          </p>
          <Button variant="outline" onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm loại vé đầu tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(ticketsByShow).map(([showId, showTickets]) => (
            <div key={showId} className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 font-medium">
                Suất diễn: {getShowDisplayText(showId)}
              </div>
              <div className="divide-y">
                {showTickets.map((ticket, index) => {
                  // Find the global index of this ticket in the tickets array
                  const globalIndex = tickets.findIndex(t => 
                    t.id === ticket.id || 
                    (t.showId === ticket.showId && t.type === ticket.type)
                  );
                  
                  return (
                    <div
                      key={ticket.id || index}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{ticket.type}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <p>{ticket.price.toLocaleString('vi-VN')}đ</p>
                          <p>Số lượng: {ticket.availableQuantity}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(globalIndex)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil w-4 h-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveTicket(globalIndex)}
                        >
                          <Trash className="w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <Button
          onClick={onNext}
          disabled={tickets.length === 0}
          className="gap-2"
        >
          Tiếp theo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
