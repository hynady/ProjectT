import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Eye, FileEdit, Trash2, CalendarDays } from "lucide-react";
import { useDataTable } from "@/commons/hooks/use-data-table";
import { Badge } from "@/commons/components/badge";
import { ActionMenu } from "@/commons/components/data-table/ActionMenu";
import { DataTable, Column, StatusOption } from "@/commons/components/data-table";
import { DeleteConfirmDialog } from "@/commons/components/data-table/DeleteConfirmDialog";
import { EmptyState } from "@/commons/components/data-table/EmptyState";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/commons/components/tooltip";
import { organizeService } from "../services/organize.service";
import { OrganizerOccaUnit, OccaFilterParams } from "../internal-types/organize.type";
import { ShowListModal } from "@/features/organize/components/ShowListModal";

interface EventsTableProps {
  searchTerm?: string;
}

export const EventsTable = ({ searchTerm = "" }: EventsTableProps) => {
  const navigate = useNavigate();
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // New state for shows modal
  const [showsModalOpen, setShowsModalOpen] = useState(false);
  const [selectedOcca, setSelectedOcca] = useState<OrganizerOccaUnit | null>(null);

  const fetchData = useCallback((params: OccaFilterParams) => {
    return organizeService.getOccas(params);
  }, []);

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
    refreshData,
    handleSearchChange,
  } = useDataTable<OrganizerOccaUnit, OccaFilterParams>({
    defaultSortField: "title",
    defaultSortDirection: "asc",
    fetchData,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearchChange(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearchChange]);

  const handleEdit = (id: string) => {
    navigate(`/organize/edit/${id}`);
  };

  const handleView = (id: string) => {
    navigate(`/occas/${id}`);
  };
  
  // New handler for viewing shows
  const handleViewShows = (occa: OrganizerOccaUnit) => {
    setSelectedOcca(occa);
    setShowsModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setEventToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      setIsDeleting(true);
      // Simulate deletion with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
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
  
  const statusOptions: StatusOption[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'draft', label: 'Bản nháp', badge: 'secondary' },
    { value: 'pending', label: 'Chờ duyệt', badge: 'warning' },
    { value: 'approved', label: 'Đã duyệt', badge: 'success' },
    { value: 'rejected', label: 'Từ chối', badge: 'destructive' }
  ];

  const columns: Column<OrganizerOccaUnit>[] = useMemo(() => [
    {
      id: "title",
      header: "Tên sự kiện",
      sortable: true,
      width: "w-[400px] max-w-[400px]",
      truncate: true,
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
      id: "location",
      header: "Địa điểm",
      sortable: true,
      width: "w-[300px] max-w-[300px]",
      truncate: false,
      cell: (occa) => (
        <div className="overflow-hidden">
          <TruncatedText text={occa.location} />
        </div>
      )
    },
    {
      id: "approvalStatus",
      header: "Trạng thái duyệt",
      width: "w-[140px]",
      align: "center",
      cell: (occa) => (
        <div className="flex justify-center">
          <Badge
            variant={
              occa.approvalStatus === "approved"
                ? "success"
                : occa.approvalStatus === "pending"
                ? "warning"
                : occa.approvalStatus === "rejected"
                ? "destructive" 
                : "secondary"
            }
            className="whitespace-nowrap"
          >
            {occa.approvalStatus === "approved" ? "Đã duyệt" :
             occa.approvalStatus === "pending" ? "Chờ duyệt" :
             occa.approvalStatus === "rejected" ? "Từ chối" :
             "Nháp"}
          </Badge>
        </div>
      )
    },
  ], []);
  
  const eventEmptyState = (
    <EmptyState 
      searchQuery={searchTerm}
      statusFilter={statusFilter}
      title={searchTerm ? "Không tìm thấy sự kiện" : "Chưa có sự kiện nào"}
      description={
        searchTerm
          ? `Không tìm thấy sự kiện phù hợp với từ khóa "${searchTerm}" ${statusFilter !== 'all' ? ` và bộ lọc đã chọn` : ''}`
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
        searchQuery={searchTerm}
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
                label: "Xem suất diễn",
                icon: <CalendarDays className="h-4 w-4" />,
                onClick: () => handleViewShows(occa)
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
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Xóa sự kiện"
        description="Hành động này không thể hoàn tác. Sự kiện sẽ bị xóa vĩnh viễn khỏi hệ thống."
        isDeleting={isDeleting}
      />
      
      {/* Shows modal */}
      {selectedOcca && (
        <ShowListModal
          open={showsModalOpen}
          onOpenChange={setShowsModalOpen}
          occa={selectedOcca}
        />
      )}
    </>
  );
};
