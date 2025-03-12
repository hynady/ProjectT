import { useState } from "react";
import { Button } from "@/commons/components/button";
import { Input } from "@/commons/components/input";
import { Label } from "@/commons/components/label";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/commons/components/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/commons/components/calendar";
import { cn } from "@/commons/lib/utils/utils";
import { ShowFormData } from "../internal-types/organize.type";
import { toast } from "@/commons/hooks/use-toast";

interface ShowsFormProps {
  shows: ShowFormData[];
  onChange: (shows: ShowFormData[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export const ShowsForm = ({ shows, onChange, onBack, onNext }: ShowsFormProps) => {
  const [showDialogOpen, setShowDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime("");
    setEditingIndex(null);
  };

  const handleAddShow = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn đầy đủ ngày và giờ diễn",
        variant: "destructive",
      });
      return;
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const newShow: ShowFormData = {
      id: editingIndex !== null ? shows[editingIndex].id : `show-${Date.now()}`,
      date: formattedDate,
      time: selectedTime,
    };

    let updatedShows;
    if (editingIndex !== null) {
      // Edit existing show
      updatedShows = [...shows];
      updatedShows[editingIndex] = newShow;
    } else {
      // Check if this date and time combination already exists
      const exists = shows.some(
        (show) => show.date === formattedDate && show.time === selectedTime
      );

      if (exists) {
        toast({
          title: "Trùng lặp",
          description: "Suất diễn này đã tồn tại",
          variant: "destructive",
        });
        return;
      }

      // Add new show
      updatedShows = [...shows, newShow];
    }

    onChange(updatedShows);
    resetForm();
    setShowDialogOpen(false);
  };

  const handleEditShow = (index: number) => {
    const show = shows[index];
    setSelectedDate(new Date(show.date));
    setSelectedTime(show.time);
    setEditingIndex(index);
    setShowDialogOpen(true);
  };

  const handleRemoveShow = (index: number) => {
    const updatedShows = [...shows];
    updatedShows.splice(index, 1);
    onChange(updatedShows);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Thêm các suất diễn</h2>
        <Dialog open={showDialogOpen} onOpenChange={setShowDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2" onClick={() => resetForm()}>
              <Plus className="h-4 w-4" />
              Thêm suất diễn
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? "Sửa suất diễn" : "Thêm suất diễn"}
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
              <Button onClick={handleAddShow}>
                {editingIndex !== null ? "Cập nhật" : "Thêm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {shows.length === 0 ? (
        <div className="border rounded-lg p-8 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground mb-4">
            Chưa có suất diễn nào được thêm vào
          </p>
          <Button variant="outline" onClick={() => setShowDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm suất diễn đầu tiên
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {shows
            .sort((a, b) => {
              const dateA = new Date(`${a.date}T${a.time}`);
              const dateB = new Date(`${b.date}T${b.time}`);
              return dateA.getTime() - dateB.getTime();
            })
            .map((show, index) => (
              <div
                key={show.id || index}
                className="flex items-center justify-between p-4"
              >
                <div className="space-y-1">
                  <p className="font-medium">
                    {format(new Date(show.date), "EEEE, dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {show.time}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditShow(index)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil w-4 h-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveShow(index)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
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
          disabled={shows.length === 0}
          className="gap-2"
        >
          Tiếp theo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
