import { ReactNode } from "react";
import { Calendar, PlusCircle, Search } from "lucide-react";
import { Button } from "@/commons/components/button";

interface EmptyStateProps {
  searchQuery?: string;
  statusFilter?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ 
  searchQuery, 
  statusFilter = 'all',
  title,
  description,
  icon,
  actionLabel = "Tạo mới",
  onAction
}: EmptyStateProps) => {
  // Default title based on search state
  const defaultTitle = searchQuery
    ? "Không tìm thấy kết quả"
    : "Chưa có dữ liệu";

  // Default description based on search and filter state
  const defaultDescription = searchQuery
    ? `Không tìm thấy kết quả phù hợp với từ khóa "${searchQuery}" ${statusFilter !== 'all' ? ` và bộ lọc đã chọn` : ''}`
    : statusFilter !== 'all'
      ? `Không có dữ liệu nào trong trạng thái đã chọn`
      : "Không có dữ liệu nào để hiển thị";

  // Default icon based on search state
  const defaultIcon = searchQuery 
    ? <Search className="w-10 h-10 text-muted-foreground" />
    : <Calendar className="w-10 h-10 text-muted-foreground" />;
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="rounded-full bg-muted/50 w-20 h-20 flex items-center justify-center mb-4">
        {icon || defaultIcon}
      </div>
      
      <h3 className="text-xl font-semibold mb-1">
        {title || defaultTitle}
      </h3>
      
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {description || defaultDescription}
      </p>
      
      {onAction && (
        <Button onClick={onAction} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
