import { useState, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/commons/components/button";
import { Calendar } from "@/commons/components/calendar";
import { Input } from "@/commons/components/input";
import { Label } from "@/commons/components/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/commons/components/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/commons/components/popover";
import { cn } from "@/commons/lib/utils/utils";
import { toast } from "@/commons/hooks/use-toast";

export interface ShowFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (date: string, time: string) => void;
  editingShow?: {
    date: string;
    time: string;
  };
  title?: string;
}

export const ShowFormDialog = ({ 
  open, 
  onOpenChange, 
  onSave, 
  editingShow,
  title
}: ShowFormDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Reset form when dialog opens or editing show changes
  useEffect(() => {
    if (open) {
      if (editingShow) {
        setSelectedDate(new Date(editingShow.date));
        setSelectedTime(editingShow.time);
      } else {
        setSelectedDate(undefined);
        setSelectedTime("");
      }
    }
  }, [open, editingShow]);

  const handleSave = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn đầy đủ ngày và giờ diễn",
        variant: "destructive",
      });
      return;
    }
    
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    onSave(formattedDate, selectedTime);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {title || (editingShow ? "Sửa suất diễn" : "Thêm suất diễn")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Ngày diễn</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: vi })
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={vi}
                  initialFocus
                  fromDate={new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Giờ diễn</Label>
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              placeholder="HH:mm"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <Button onClick={handleSave}>
            {editingShow ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
