import { useState } from "react";
import { Button } from "@/commons/components/button";
import { ShowFormData, ShowSaleStatus } from "../internal-types/organize.type";
import { Plus, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/commons/components/card";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/commons/components/dialog";
import { ShowFormDialog } from "./shows/ShowFormDialog";
import { ShowCard } from "./shows/ShowCard";

interface ShowsFormProps {
  shows: ShowFormData[];
  onChange: (shows: ShowFormData[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export const ShowsForm = ({
  shows,
  onChange,
  onBack,
  onNext
}: ShowsFormProps) => {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showToDeleteIndex, setShowToDeleteIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Handle adding or updating a show
  const handleSaveShow = (date: string, time: string, status: string) => {
    const newShow: ShowFormData = {
      id: editIndex !== null ? shows[editIndex]?.id || `show-${Date.now()}` : `show-${Date.now()}`,
      date,
      time,
      saleStatus: status as ShowSaleStatus
    };
    
    if (editIndex !== null) {
      // Update existing show
      const updatedShows = [...shows];
      updatedShows[editIndex] = newShow;
      onChange(updatedShows);
      setEditIndex(null);
    } else {
      // Add new show
      onChange([...shows, newShow]);
    }
    
    setIsDialogOpen(false);
  };
  
  // Set up form for editing
  const handleEditShow = (index: number) => {
    setEditIndex(index);
    setIsDialogOpen(true);
  };
  
  // Delete show after confirmation
  const handleDeleteShow = () => {
    if (showToDeleteIndex !== null) {
      const updatedShows = shows.filter((_, i) => i !== showToDeleteIndex);
      onChange(updatedShows);
      setDeleteDialogOpen(false);
      setShowToDeleteIndex(null);
    }
  };
  
  // Show delete confirmation
  const showDeleteConfirm = (index: number) => {
    setShowToDeleteIndex(index);
    setDeleteDialogOpen(true);
  };
  
  // Update show status
  const handleStatusChange = (index: number, status: string) => {
    const updatedShows = [...shows];
    updatedShows[index] = { 
      ...updatedShows[index], 
      saleStatus: status as ShowSaleStatus 
    };
    onChange(updatedShows);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Thêm suất diễn
        </h2>
        <p className="text-sm text-muted-foreground">
          Thêm các suất diễn cho sự kiện của bạn.
        </p>
      </div>

      {/* Shows list */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            Suất diễn đã thêm ({shows.length})
          </h3>
          
          <Button 
            size="sm" 
            className="gap-1" 
            onClick={() => {
              setEditIndex(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Thêm suất diễn
          </Button>
        </div>
        
        {shows.length === 0 ? (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <p className="text-muted-foreground mb-4">
                Bạn chưa thêm suất diễn nào.
                <br />
                Thêm ít nhất một suất diễn để tiếp tục.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm suất diễn đầu tiên
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shows.map((show, index) => (
              <ShowCard
                key={show.id || index}
                show={show}
                index={index}
                onEdit={handleEditShow}
                onDelete={showDeleteConfirm}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Show Form Dialog */}
      <ShowFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveShow}
        showData={editIndex !== null ? shows[editIndex] : null}
      />
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc chắn muốn xóa suất diễn này không?</p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteShow}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={shows.length === 0}
        >
          Tiếp theo
        </Button>
      </div>
    </div>
  );
};
