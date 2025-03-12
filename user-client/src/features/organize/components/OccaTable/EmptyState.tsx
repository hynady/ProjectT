import { useNavigate } from "react-router-dom";
import { Calendar, PlusCircle, Search } from "lucide-react";
import { Button } from "@/commons/components/button";
import { StatusFilter } from "../OccaList";

interface EmptyStateProps {
  searchQuery?: string;
  statusFilter: StatusFilter;
}

export const EmptyState = ({ searchQuery, statusFilter }: EmptyStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="rounded-full bg-muted/50 w-20 h-20 flex items-center justify-center mb-4">
        {searchQuery ? (
          <Search className="w-10 h-10 text-muted-foreground" />
        ) : (
          <Calendar className="w-10 h-10 text-muted-foreground" />
        )}
      </div>
      
      <h3 className="text-xl font-semibold mb-1">
        {searchQuery
          ? "Không tìm thấy kết quả"
          : "Chưa có sự kiện nào"}
      </h3>
      
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {searchQuery
          ? `Không tìm thấy sự kiện phù hợp với từ khóa "${searchQuery}" ${statusFilter !== 'all' ? ` và bộ lọc đã chọn` : ''}`
          : statusFilter !== 'all'
            ? `Không có sự kiện nào trong trạng thái đã chọn`
            : "Bắt đầu tạo sự kiện đầu tiên của bạn để quản lý"}
      </p>
      
      <Button onClick={() => navigate("/organize/create")} className="gap-2">
        <PlusCircle className="h-4 w-4" />
        Tạo sự kiện mới
      </Button>
    </div>
  );
};
