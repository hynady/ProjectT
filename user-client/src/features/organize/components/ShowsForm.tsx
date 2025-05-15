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
  // Thêm các hàm từ useOccaForm
  createShow?: (show: Omit<ShowFormData, 'id'>) => ShowFormData;
  addShow?: (show: Omit<ShowFormData, 'id'>) => ShowFormData;
  updateShow?: (showId: string, show: Partial<ShowFormData>) => void;
  deleteShow?: (showId: string) => void;
}

export const ShowsForm = ({
  shows,
  onChange,
  onBack,
  onNext,
  createShow,
  addShow,
  updateShow,
  deleteShow
}: ShowsFormProps) => {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showToDeleteIndex, setShowToDeleteIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Handle adding or updating a show
  const handleSaveShow = (date: string, time: string, status: string, autoUpdateStatus: boolean) => {
    // Nếu có các hàm từ useOccaForm, ưu tiên sử dụng chúng
    if (editIndex !== null) {
      // Cập nhật show
      const showId = shows[editIndex]?.id;
      if (updateShow && showId) {
        updateShow(showId, {
          date,
          time,
          saleStatus: status as ShowSaleStatus,
          autoUpdateStatus
        });
      } else {
        // Fallback nếu không có hàm updateShow
        const updatedShows = [...shows];
        updatedShows[editIndex] = {
          id: shows[editIndex]?.id || '',
          date,
          time,
          saleStatus: status as ShowSaleStatus,
          autoUpdateStatus
        };
        onChange(updatedShows);
      }
      setEditIndex(null);
    } else {
      // Thêm show mới
      if (addShow) {
        addShow({
          date,
          time,
          saleStatus: status as ShowSaleStatus,
          autoUpdateStatus
        });
      } else if (createShow) {
        // Tạo show mới rồi thêm vào danh sách
        const newShow = createShow({
          date,
          time,
          saleStatus: status as ShowSaleStatus,
          autoUpdateStatus
        });
        onChange([...shows, newShow]);
      } else {
        // Fallback nếu không có hàm addShow hoặc createShow
        onChange([...shows, {
          id: `temp-show-${Date.now()}`,
          date,
          time,
          saleStatus: status as ShowSaleStatus,
          autoUpdateStatus
        }]);
      }
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
    if (showToDeleteIndex === null) return;

    const showId = shows[showToDeleteIndex]?.id;
    
    if (deleteShow && showId) {
      deleteShow(showId);
    } else {
      // Fallback nếu không có hàm deleteShow
      const updatedShows = shows.filter((_, index) => index !== showToDeleteIndex);
      onChange(updatedShows);
    }
    
    setShowToDeleteIndex(null);
    setDeleteDialogOpen(false);
  };
  
  // Show delete confirmation dialog
  const showDeleteConfirm = (index: number) => {
    setShowToDeleteIndex(index);
    setDeleteDialogOpen(true);
  };
  
  // Status change handler
  const handleStatusChange = (index: number, newStatus: string) => {
    const showId = shows[index]?.id;
    
    if (updateShow && showId) {
      updateShow(showId, { saleStatus: newStatus as ShowSaleStatus });
    } else {
      // Fallback nếu không có hàm updateShow
      const updatedShows = [...shows];
      updatedShows[index] = {
        ...updatedShows[index],
        saleStatus: newStatus as ShowSaleStatus,
      };
      onChange(updatedShows);
    }
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
