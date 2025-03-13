import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Check, CheckCircle2, Clock, Eye, FileEdit, Trash2 } from "lucide-react";
import { useDataTable } from "@/commons/hooks/use-data-table";
import { Badge } from "@/commons/components/badge";
import { ActionMenu } from "@/commons/components/data-table/ActionMenu";
import { DataTable, Column, StatusOption } from "@/commons/components/data-table";
import { DeleteConfirmDialog } from "@/commons/components/data-table/DeleteConfirmDialog";
import { EmptyState } from "@/commons/components/data-table/EmptyState";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/commons/components/tooltip";
import { organizeService } from "../services/organize.service";
import { OrganizerOccaUnit, OccaFilterParams } from "../internal-types/organize.type";

interface EventsTableProps {
  searchQuery?: string;
}

export type StatusFilter = 'all' | 'active' | 'completed' | 'draft';

export const EventsTable = ({ searchQuery = "" }: EventsTableProps) => {
  const navigate = useNavigate();
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Configure the data table hook with your API service
  const {
    data,
    loading,
    error,
    totalItems,
    totalPages,
    isLast,
    isFirst,
    page,
    pageSize,
    sortField,
    sortDirection,
    statusFilter,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleStatusChange,
    refreshData
  } = useDataTable<OrganizerOccaUnit, OccaFilterParams>({
    defaultSortField: "date",
    defaultSortDirection: "asc",
    fetchData: organizeService.getOccas,
    defaultSearchQuery: searchQuery
  });

  const handleEdit = (id: string) => {
    navigate(`/organize/edit/${id}`);
  };

  const handleView = (id: string) => {
    navigate(`/occas/${id}`);
  };

  const confirmDelete = (id: string) => {
    setEventToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      setIsDeleting(true);
      // In a real app, call the delete API
      // await organizeService.deleteOcca(eventToDelete);
      
      // For now just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh data after deletion
      refreshData();
      
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (err) {
      console.error("Error deleting event:", err);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Helper function to render truncated text with tooltip
  const TruncatedText = ({ text, className = "" }: { text: string, className?: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`max-w-full overflow-hidden text-ellipsis whitespace-nowrap ${className}`}>{text}</div>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="max-w-xs">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  
  // Define status options for filtering
  const statusOptions: StatusOption[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'active', label: 'Đang bán vé', badge: 'default' },
    { value: 'completed', label: 'Đã kết thúc', badge: 'outline' },
    { value: 'draft', label: 'Bản nháp', badge: 'secondary' }
  ];

  // Define columns for the data table
  const columns: Column<OrganizerOccaUnit>[] = useMemo(() => [
    {
      id: "title",
      header: "Tên sự kiện",
      sortable: true,
      width: "w-[300px] max-w-[300px]",
      truncate: true, // Disable auto-truncation as we handle it in our custom cell
      cell: (occa) => (
        <div className="flex items-center space-x-2 max-w-full">
          <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {occa.image ? (
              <img 
                src={occa.image} 
                alt={occa.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    const fallbackElement = document.createElement('div');
                    e.currentTarget.parentElement.appendChild(fallbackElement);
                    fallbackElement.innerHTML = '<svg class="w-full h-full p-2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M3 10h18"/><path d="m17 22 5-5"/><path d="m17 17 5 5"/></svg>';
                  }
                }}
              />
            ) : (
              <Calendar className="w-full h-full p-2 text-muted-foreground" />
            )}
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <TruncatedText text={occa.title} className="font-medium" />
          </div>
        </div>
      )
    },
    {
      id: "date",
      header: "Ngày diễn ra",
      sortable: true,
      width: "w-[120px] whitespace-nowrap",
      cell: (occa) => format(new Date(occa.date), "dd/MM/yyyy")
    },
    {
      id: "location",
      header: "Địa điểm",
      sortable: true,
      width: "w-[200px] max-w-[200px]",
      truncate: false, // Disable auto-truncation as we handle it in our custom cell
      cell: (occa) => (
        <div className="overflow-hidden">
          <TruncatedText text={occa.location} />
        </div>
      )
    },
    {
      id: "ticketSoldPercent",
      header: "Vé đã bán",
      sortable: true,
      width: "w-[120px]",
      align: "center",
      truncate: false, // Progress bars shouldn't be truncated
      cell: (occa) => {
        if (occa.status === 'draft') {
          return <span className="text-center block text-muted-foreground">-</span>;
        }
        return (
          <div className="flex flex-col items-center">
            <div className="text-sm">
              <span className="font-medium">{occa.ticketsSold}</span>
              <span className="text-muted-foreground">/{occa.ticketsTotal}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
              <div 
                className="bg-primary h-1.5 rounded-full" 
                style={{ width: `${(occa.ticketsSold / occa.ticketsTotal) * 100}%` }} 
              ></div>
            </div>
          </div>
        );
      }
    },
    {
      id: "status",
      header: "Trạng thái",
      width: "w-[120px]",
      align: "center",
      truncate: false, // Status badges shouldn't be truncated
      cell: (occa) => (
        <div className="flex justify-center">
          <Badge
            variant={
              occa.status === "active"
                ? "default"
                : occa.status === "completed"
                ? "outline"
                : "secondary"
            }
            className="whitespace-nowrap"
          >
            {occa.status === "active" ? (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Đang bán vé
              </div>
            ) : occa.status === "completed" ? (
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 mr-1" />
                Đã kết thúc
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 mr-1" />
                Bản nháp
              </div>
            )}
          </Badge>
        </div>
      )
    },
  ], []);
  
  // Custom EmptyState for events
  const eventEmptyState = (
    <EmptyState 
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      title={searchQuery ? "Không tìm thấy sự kiện" : "Chưa có sự kiện nào"}
      description={
        searchQuery
          ? `Không tìm thấy sự kiện phù hợp với từ khóa "${searchQuery}" ${statusFilter !== 'all' ? ` và bộ lọc đã chọn` : ''}`
          : statusFilter !== 'all'
            ? `Không có sự kiện nào trong trạng thái đã chọn`
            : "Bắt đầu tạo sự kiện đầu tiên của bạn để quản lý"
      }
      actionLabel="Tạo sự kiện mới"
      onAction={() => navigate("/organize/create")}
    />
  );

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        isLoading={loading}
        error={error}
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        isLast={isLast}
        isFirst={isFirst}
        sortField={sortField}
        sortDirection={sortDirection as 'asc' | 'desc'}
        statusOptions={statusOptions}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        emptyComponent={eventEmptyState}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={handleSortChange}
        onStatusChange={handleStatusChange}
        rowActions={(occa) => (
          <ActionMenu
            actions={[
              {
                label: "Xem chi tiết",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => handleView(occa.id)
              },
              {
                label: "Chỉnh sửa",
                icon: <FileEdit className="h-4 w-4" />,
                onClick: () => handleEdit(occa.id)
              },
              {
                label: "Xóa",
                icon: <Trash2 className="h-4 w-4" />,
                variant: "destructive",
                onClick: () => confirmDelete(occa.id)
              }
            ]}
          />
        )}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Xóa sự kiện"
        description="Hành động này không thể hoàn tác. Sự kiện sẽ bị xóa vĩnh viễn khỏi hệ thống."
        isDeleting={isDeleting}
      />
    </>
  );
};
