import { Plus } from "lucide-react";
import { Button } from "@/commons/components/button";

interface EmptyStateProps {
  isFiltered: boolean;
  onAddShow: () => void;
  onClearFilters: () => void;
}

export const EmptyState = ({ isFiltered, onAddShow, onClearFilters }: EmptyStateProps) => {
  if (isFiltered) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Không tìm thấy suất diễn phù hợp với bộ lọc.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onClearFilters}
        >
          Xóa bộ lọc
        </Button>
      </div>
    );
  }
  
  return (
    <div className="py-8 text-center">
      <p className="text-muted-foreground">Chưa có suất diễn nào được thiết lập.</p>
      <Button 
        variant="outline" 
        className="mt-4 gap-1"
        onClick={onAddShow}
      >
        <Plus className="h-4 w-4" /> Thêm suất diễn đầu tiên
      </Button>
    </div>
  );
};
