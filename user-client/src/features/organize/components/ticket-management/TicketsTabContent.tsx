import { TicketManagementSharedProps } from "./utils";
import { InfoCards } from "./InfoCards";
import { TicketsTable } from "../../components/tickets/TicketsTable";
import { TicketInfo } from "../../internal-types/ticket.type";

interface TicketsTabContentProps extends TicketManagementSharedProps {
  tickets: TicketInfo[];
  loading: boolean;
  error: string | Error | null;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  statusFilter: string;
  isFirst: boolean;
  isLast: boolean;
  searchTerm: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  onStatusChange: (status: string) => void;
  refreshData: () => void;
  onViewTicketDetails: (id: string) => void;
}

export const TicketsTabContent = ({
  occaInfo,
  showInfo,
  totalSoldTickets,
  revenueByClass,
  tickets,
  loading,
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
  searchTerm,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onStatusChange,
  refreshData,
  onViewTicketDetails,
}: TicketsTabContentProps) => {
  // Convert error to string for TicketsTable
  const errorMessage = error ? (error instanceof Error ? error.message : String(error)) : null;
  
  return (
    <div className="space-y-4">
      {/* Info cards */}
      <InfoCards 
        occaInfo={occaInfo}
        showInfo={showInfo}
        totalSoldTickets={totalSoldTickets}
        revenueByClass={revenueByClass}
      />

      {/* Tickets table */}
      <div className="rounded-md border">
        <TicketsTable 
          data={tickets}
          isLoading={loading}
          error={errorMessage}
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          sortField={sortField}
          sortDirection={sortDirection}
          statusFilter={statusFilter}
          isFirst={isFirst}
          isLast={isLast}
          searchTerm={searchTerm}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onSortChange={onSortChange}
          onStatusChange={onStatusChange}
          refreshData={refreshData}
          onViewTicketDetails={onViewTicketDetails}
        />
      </div>
    </div>
  );
};
