import { useState } from "react";
import { Button } from "@/commons/components/button";
import { ArrowLeft, ArrowRight, Plus, Trash } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ShowFormData } from "../internal-types/organize.type";
import { toast } from "@/commons/hooks/use-toast";
import { ShowFormDialog } from "./shows/ShowFormDialog";

interface ShowsFormProps {
  shows: ShowFormData[];
  onChange: (shows: ShowFormData[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export const ShowsForm = ({ shows, onChange, onBack, onNext }: ShowsFormProps) => {
  const [showDialogOpen, setShowDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const resetForm = () => {
    setEditingIndex(null);
  };

  const handleAddShow = (date: string, time: string) => {
    const newShow: ShowFormData = {
      id: editingIndex !== null ? shows[editingIndex].id : `show-${Date.now()}`,
      date,
      time,
    };

    let updatedShows;
    if (editingIndex !== null) {
      // Edit existing show
      updatedShows = [...shows];
      updatedShows[editingIndex] = newShow;
    } else {
      // Check if this date and time combination already exists
      const exists = shows.some(
        (show) => show.date === date && show.time === time
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
    setEditingIndex(index);
    setShowDialogOpen(true);
  };

  const handleRemoveShow = (index: number) => {
    const updatedShows = [...shows];
    updatedShows.splice(index, 1);
    onChange(updatedShows);
  };

  const openAddDialog = () => {
    resetForm();
    setShowDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Thêm các suất diễn</h2>
        <Button variant="outline" className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Thêm suất diễn
        </Button>
      </div>

      {shows.length === 0 ? (
        <div className="border rounded-lg p-8 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground mb-4">
            Chưa có suất diễn nào được thêm vào
          </p>
          <Button variant="outline" onClick={openAddDialog} className="gap-2">
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

      <div className="justify-between pt-4 hidden sm:flex">
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

      {/* Use the new separated ShowFormDialog component */}
      <ShowFormDialog
        open={showDialogOpen}
        onOpenChange={setShowDialogOpen}
        onSave={handleAddShow}
        editingShow={editingIndex !== null ? shows[editingIndex] : undefined}
      />
    </div>
  );
};
