import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Eye } from "lucide-react";
import { TicketInfo } from "../../internal-types/ticket.type";
import { DataTable, Column, StatusOption } from "@/commons/components/data-table";
import { Badge } from "@/commons/components/badge";
import { ActionMenu } from "@/commons/components/data-table/ActionMenu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/commons/components/tooltip";
import { formatCurrency } from "@/utils/formatters";

interface TicketsTableProps {
  data: TicketInfo[];
  isLoading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  statusFilter: string;
  isFirst: boolean;
  isLast: boolean;
  searchTerm?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  onStatusChange: (status: string) => void;
  refreshData: () => void;
  onViewTicketDetails?: (ticketId: string) => void;
}

export const TicketsTable = ({ 
  data,
  isLoading,
  error,
  page,
  pageSize,
  totalItems,
  totalPages,
  sortField,
  sortDirection,
  statusFilter,
  isFirst,
  isLast,
  searchTerm = "",
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onStatusChange,
  refreshData,
  onViewTicketDetails
}: TicketsTableProps) => {
  // Status options for filtering
  const statusOptions: StatusOption[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'checked-in', label: 'Đã check-in', badge: 'success' },
    { value: 'not-checked-in', label: 'Chưa check-in', badge: 'secondary' }
  ];

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

  // Define data table columns
  const columns: Column<TicketInfo>[] = [
    {
      id: "ticketId",
      header: "Mã vé",
      sortable: true,
      width: "w-[150px]",
      cell: (ticket) => <TruncatedText text={ticket.ticketId} />
    },
    {
      id: "occaTitle",
      header: "Sự kiện",
      sortable: true,
      width: "w-[250px]",
      cell: (ticket) => <TruncatedText text={ticket.occaTitle} className="font-medium" />
    },
    {
      id: "showDateTime",
      header: "Thời gian",
      sortable: true,
      width: "w-[180px]",
      cell: (ticket) => (
        <div className="flex flex-col">
          <span>{ticket.showDate}</span>
          <span className="text-muted-foreground text-xs">{ticket.showTime}</span>
        </div>
      )
    },
    {
      id: "ticketType",
      header: "Loại vé",
      sortable: true,
      width: "w-[120px]",
      cell: (ticket) => (
        <Badge variant="outline" className="capitalize">
          {ticket.ticketType}
        </Badge>
      )
    },
    {
      id: "ticketPrice",
      header: "Giá vé",
      sortable: true,
      width: "w-[120px]",
      cell: (ticket) => <span>{formatCurrency(ticket.ticketPrice)}</span>
    },
    {
      id: "recipientInfo",
      header: "Thông tin người nhận",
      sortable: true,
      width: "w-[250px]",
      cell: (ticket) => (
        <div className="space-y-1">
          <div className="font-medium">{ticket.recipientName}</div>
          <div className="text-sm text-muted-foreground">{ticket.recipientEmail}</div>
          <div className="text-sm text-muted-foreground">{ticket.recipientPhone}</div>
        </div>
      )
    },
    {
      id: "purchasedAt",
      header: "Ngày mua",
      sortable: true,
      width: "w-[150px]",
      cell: (ticket) => (
        <span>
          {format(parseISO(ticket.purchasedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
        </span>
      )
    },
    {
      id: "checkedInStatus",
      header: "Trạng thái",
      sortable: false,
      width: "w-[120px]",
      cell: (ticket) => (
        <Badge 
          variant={ticket.checkedInAt ? "success" : "secondary"}
        >
          {ticket.checkedInAt ? "Đã check-in" : "Chưa check-in"}
        </Badge>
      )
    }
  ];  // Use the props provided by the parent component
  
  // Prepare table data with the required 'id' property for DataTable
  const tableData = data.map(ticket => ({
    ...ticket,
    id: ticket.ticketId, // Add id property for DataTable component
  }));

  const emptyState = (
    <div className="text-center py-10">
      <h3 className="text-lg font-medium">Không có vé nào</h3>
      <p className="text-muted-foreground mt-2">
        {searchTerm 
          ? "Không tìm thấy vé nào với từ khóa này. Hãy thử tìm với từ khóa khác." 
          : "Hiện tại chưa có vé nào được bán."}
      </p>
    </div>
  );  return (
    <DataTable
      data={tableData}
      columns={columns}
      isLoading={isLoading}
      error={error}
      page={page}
      pageSize={pageSize}
      totalItems={totalItems}
      totalPages={totalPages}
      sortField={sortField}
      sortDirection={sortDirection}
      statusOptions={statusOptions}
      statusFilter={statusFilter}
      searchQuery={searchTerm}
      emptyComponent={emptyState}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onSortChange={onSortChange}
      onStatusChange={onStatusChange}
      refreshData={refreshData}
      isLast={isLast}
      isFirst={isFirst}
      rowActions={(ticket) => (
        <ActionMenu
          actions={[
            {
              label: "Xem chi tiết",
              icon: <Eye className="h-4 w-4" />,
              onClick: () => onViewTicketDetails?.(ticket.ticketId)
            }
          ]}
          label="Hành động"
        />
      )}
    />
  );
};
