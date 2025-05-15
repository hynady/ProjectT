import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/commons/components/button";
import { Calendar as CalendarComponent } from "@/commons/components/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/commons/components/dialog";
import { Input } from "@/commons/components/input";
import { Label } from "@/commons/components/label";
import { ShowFormData } from "../../internal-types/organize.type";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/commons/components/popover";
import { cn } from "@/commons/lib/utils/utils";
import { Switch } from "@/commons/components/switch";

interface ShowFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (date: string, time: string, status: string, autoUpdateStatus: boolean) => void;
  showData?: ShowFormData | null;
}

export const ShowFormDialog = ({
  open,
  onOpenChange,
  onSave,
  showData
}: ShowFormDialogProps) => {
  const [date, setDate] = useState<Date | undefined>(
    showData?.date ? parse(showData.date, 'yyyy-MM-dd', new Date()) : undefined
  );
  const [time, setTime] = useState<string>(showData?.time || '19:30');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [autoUpdateStatus, setAutoUpdateStatus] = useState<boolean>(showData?.autoUpdateStatus ?? true); 

  // Reset form data when dialog opens
  useEffect(() => {
    if (open) {
      if (showData) {
        setDate(showData.date ? parse(showData.date, 'yyyy-MM-dd', new Date()) : undefined);
        setTime(showData.time || '19:30');
        setAutoUpdateStatus(showData.autoUpdateStatus ?? true);
      } else {
        setDate(undefined);
        setTime('19:30');
        setAutoUpdateStatus(true);
      }
    }
  }, [open, showData]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      return; // Validation error - date required
    }

    const formattedDate = format(date, 'yyyy-MM-dd');
    onSave(
      formattedDate,
      time,
      // Status remains unchanged if editing, 'upcoming' if new
      showData?.saleStatus || 'upcoming',
      autoUpdateStatus
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {showData ? 'Chỉnh sửa suất diễn' : 'Thêm suất diễn'}
          </DialogTitle>
          <DialogDescription>
            {showData 
              ? 'Chỉnh sửa thông tin cho suất diễn hiện tại.' 
              : 'Nhập thông tin thời gian cho suất diễn mới.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Ngày</Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    type="button"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, 'dd/MM/yyyy') : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date);
                      setPopoverOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="time">Giờ</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="autoUpdate"
                checked={autoUpdateStatus}
                onCheckedChange={setAutoUpdateStatus}
              />
              <Label htmlFor="autoUpdate" className="text-sm cursor-pointer">
                Tự động kết thúc sự kiện khi tới thời hạn
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={!date}>
              {showData ? 'Lưu' : 'Thêm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
