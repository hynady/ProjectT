import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { TicketIcon } from "lucide-react";
import { DashboardLayout } from "@/features/organize/layouts/DashboardLayout";
import { useDataTable } from "@/commons/hooks/use-data-table";
import { ticketService } from "../services/ticket.service";
import { organizeService } from "../services/organize.service";
import { TicketFilterParams, TicketInfo, TicketRevenueByClass } from "../internal-types/ticket.type";
import { OccaFormData, ShowResponse } from "../internal-types/organize.type";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/commons/components/tabs";

// Import refactored components
import {
  Header,
  TicketsTabContent,
  StatsTabContent
} from "../components/ticket-management";

const TicketManagementPage = () => {
  // Lấy cả occaId và showId từ URL parameters
  const { occaId, showId } = useParams<{ occaId?: string; showId?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [occaInfo, setOccaInfo] = useState<OccaFormData | null>(null);
  const [showInfo, setShowInfo] = useState<ShowResponse | null>(null);
  const [activeTab, setActiveTab] = useState<string>("tickets");
  const [revenueByClass, setRevenueByClass] = useState<TicketRevenueByClass[]>([]);
  const [totalSoldTickets, setTotalSoldTickets] = useState(0);
  
  // Fetch event and show details
  useEffect(() => {
    if (!occaId || !showId) return;
    
    const fetchEventAndShowInfo = async () => {
      try {
        // Lấy danh sách shows của occa này
        const shows = await organizeService.getShowsByOccaId(occaId);
        const foundShow = shows.find(s => s.id === showId);
        console.log("Found show:", foundShow);
        if (foundShow) {
          // Tìm thấy show, lưu thông tin
          setShowInfo(foundShow);
          
          // Lấy thông tin occa
          const occaDetail = await organizeService.getOccaById(occaId);
          
          setOccaInfo(occaDetail);
        } else {
          console.error('Không tìm thấy suất diễn với ID:', showId);
        }
      } catch (error) {
        console.error("Error fetching event/show details:", error);
      }
    };
    
    fetchEventAndShowInfo();
  }, [occaId, showId]);

  // Data fetching function for useDataTable
  const fetchData = useCallback(async (params: TicketFilterParams) => {
    // Only fetch tickets when a showId is available
    if (!showId) {
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        last: true,
        first: true,
        empty: true
      };
    }
    
    // Map the status filter to the checkedIn parameter
    let checkedIn: boolean | undefined = undefined;
    if (params.statusFilter === 'checked-in') {
      checkedIn = true;
    } else if (params.statusFilter === 'not-checked-in') {
      checkedIn = false;
    }
    
    // Include showId in the fetch
    const response = await ticketService.getTickets({
      ...params,
      checkedIn,
      showId
    });
    
    // Lưu trữ thông tin thống kê từ API
    if (response.revenueByTicketClass) {
      setRevenueByClass(response.revenueByTicketClass);
      
      // Tổng số vé đã bán
      setTotalSoldTickets(response.totalElements);
    }
    
    // Adapt the response to the format expected by useDataTable
    return {
      content: response.tickets,
      totalElements: response.totalElements,
      totalPages: response.totalPages,
      number: response.page,
      last: response.page === response.totalPages - 1,
      first: response.page === 0,
      empty: response.tickets.length === 0
    };
  }, [showId]);

  // useDataTable hook configuration
  const {
    data: tickets,
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
  } = useDataTable<TicketInfo, TicketFilterParams>({
    defaultSortField: "purchasedAt",
    defaultSortDirection: "desc",
    fetchData,
    skipInitialFetch: !showId // Skip initial fetch if no showId is available
  });

  // Search debounce
  useEffect(() => {
    if (!showId) return;
    
    const timeoutId = setTimeout(() => {
      handleSearchChange(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearchChange, showId]);

  // Utility functions
  const handleViewTicketDetails = (ticketId: string) => {
    console.log("View ticket details for:", ticketId);
    // Future implementation
  };
  if (!showId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
          <div className="max-w-md space-y-4">
            <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">Quản lý vé</h2>
            <p className="text-muted-foreground">
              Chọn một sự kiện và suất diễn từ menu bên trái để xem và quản lý vé.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-fit flex flex-col gap-4">
        {/* Header with event title and search */}
        <Header 
          occaInfo={occaInfo}
          showInfo={showInfo}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="tickets">Danh sách vé</TabsTrigger>
            <TabsTrigger value="stats">Thống kê</TabsTrigger>
          </TabsList>
          
          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4">
            <TicketsTabContent
              occaInfo={occaInfo}
              showInfo={showInfo}
              totalSoldTickets={totalSoldTickets}
              revenueByClass={revenueByClass}
              tickets={tickets}
              loading={loading}
              error={error}
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              totalPages={totalPages}
              sortField={sortField || "purchasedAt"}
              sortDirection={sortDirection}
              statusFilter={statusFilter}
              isFirst={isFirst}
              isLast={isLast}
              searchTerm={searchQuery}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSortChange={handleSortChange}
              onStatusChange={handleStatusChange}
              refreshData={refreshData}
              onViewTicketDetails={handleViewTicketDetails}
            />
          </TabsContent>
          
          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <StatsTabContent
              occaInfo={occaInfo}
              showInfo={showInfo}
              totalSoldTickets={totalSoldTickets}
              revenueByClass={revenueByClass}
              tickets={tickets}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TicketManagementPage;
