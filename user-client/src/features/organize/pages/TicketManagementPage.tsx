import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { 
  Search, 
  CalendarClock, 
  MapPin, 
  TicketIcon, 
  CreditCard, 
  BarChart3, 
  Users 
} from "lucide-react";
import { DashboardLayout } from "@/features/organize/layouts/DashboardLayout";
import { TicketsTable } from "../components/tickets/TicketsTable";
import { Input } from "@/commons/components/input";
import { useDataTable } from "@/commons/hooks/use-data-table";
import { ticketService } from "../services/ticket.service";
import { organizeService } from "../services/organize.service";
import { TicketFilterParams, TicketInfo, TicketRevenueByClass } from "../internal-types/ticket.type";
import { OccaFormData, ShowResponse, ShowSaleStatus } from "../internal-types/organize.type";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/commons/components/card";
import { Badge } from "@/commons/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/commons/components/tabs";
import { Separator } from "@/commons/components/separator";
import { formatCurrency } from "@/utils/formatters";

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

  const formatShowDateTime = (date?: string, time?: string) => {
    if (!date) return "";
    try {
      const dateObj = new Date(date);
      const dateStr = dateObj.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      return time ? `${dateStr} ${time}` : dateStr;
    } catch {
      return date;
    }
  };
  // Statistics calculations
  const getTotalTickets = (): number => {
    if (!showInfo) return 0;
    return showInfo.tickets.reduce((sum, ticket) => sum + ticket.available, 0);
  };

  const getTotalSoldTickets = (): number => {
    // Sử dụng totalSoldTickets từ API nếu có
    if (totalSoldTickets > 0) return totalSoldTickets;
    
    // Fallback: sử dụng sold từ showInfo
    if (!showInfo) return 0;
    return showInfo.tickets.reduce((sum, ticket) => sum + (ticket.sold || 0), 0);
  };

  const getSoldPercentage = (): number => {
    const total = getTotalTickets();
    if (total === 0) return 0;
    return Math.round((getTotalSoldTickets() / total) * 100);
  };

  const getTotalRevenue = (): number => {
    // Sử dụng revenueByTicketClass nếu có
    if (revenueByClass.length > 0) {
      return revenueByClass.reduce((sum, item) => sum + item.totalRevenue, 0);
    }
    
    // Fallback: sử dụng cách tính cũ
    if (!showInfo) return 0;
    return showInfo.tickets.reduce(
      (sum, ticket) => sum + (ticket.price * (ticket.sold || 0)), 
      0
    );
  };
  // UI helpers
  const getShowSaleStatusBadge = (status?: ShowSaleStatus) => {
    if (!status) return null;
    
    switch (status) {
      case 'on_sale':
        return <Badge variant="success">Đang bán</Badge>;
      case 'sold_out':
        return <Badge variant="destructive">Đã bán hết</Badge>;
      case 'upcoming':
        return <Badge variant="warning">Sắp mở bán</Badge>;
      case 'ended':
        return <Badge variant="outline">Đã kết thúc</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Distribution of checked-in vs non-checked-in tickets
  const checkedInStatistics = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return { checkedIn: 0, notCheckedIn: 0, total: 0 };
    }
    
    const checkedIn = tickets.filter(ticket => ticket.checkedInAt).length;
    const total = tickets.length;
    
    return {
      checkedIn,
      notCheckedIn: total - checkedIn,
      total,
      checkedInPercentage: Math.round((checkedIn / total) * 100) || 0
    };
  }, [tickets]);

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
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {occaInfo?.basicInfo.title || "Đang tải..."}
            </h2>
            <p className="text-muted-foreground">
              Quản lý vé cho suất diễn: {formatShowDateTime(showInfo?.date, showInfo?.time)}
            </p>
          </div>
          
          <div className="max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              className="pl-8 w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="tickets">Danh sách vé</TabsTrigger>
            <TabsTrigger value="stats">Thống kê</TabsTrigger>
          </TabsList>
          
          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4">
            {/* Info cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Thông tin suất diễn
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Ngày</span>
                      <span className="font-medium">{formatShowDateTime(showInfo?.date, "")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Thời gian</span>
                      <span className="font-medium">{showInfo?.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-muted-foreground text-sm">Trạng thái</span>
                      {getShowSaleStatusBadge(showInfo?.saleStatus)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TicketIcon className="h-4 w-4" />
                    Vé
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Loại vé</span>
                      <span className="font-medium">{showInfo?.tickets.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Tổng số vé</span>
                      <span className="font-medium">{getTotalTickets()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Đã bán</span>
                      <span className="font-medium">{getTotalSoldTickets()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Doanh thu
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Tỷ lệ bán</span>
                      <span className="font-medium">{getSoldPercentage()}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Còn lại</span>
                      <span className="font-medium">{getTotalTickets() - getTotalSoldTickets()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Tổng tiền</span>
                      <span className="font-medium">{formatCurrency(getTotalRevenue())}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Địa điểm
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  <p className="text-sm">{occaInfo?.basicInfo.location}</p>
                  <p className="text-xs text-muted-foreground mt-1">{occaInfo?.basicInfo.address}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tickets table */}
            <div className="rounded-md border">
              <TicketsTable 
                data={tickets}
                isLoading={loading}
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
            </div>
          </TabsContent>
          
          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Trạng thái check-in
                  </CardTitle>
                  <CardDescription>
                    Số lượng người đã check-in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[200px]">
                    <div className="text-5xl font-bold mb-2">
                      {checkedInStatistics.checkedInPercentage}%
                    </div>
                    <p className="text-muted-foreground">Tỷ lệ check-in</p>
                    
                    <Separator className="my-6" />
                    
                    <div className="w-full grid grid-cols-2 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="text-2xl font-semibold">{checkedInStatistics.checkedIn}</div>
                        <p className="text-sm text-muted-foreground">Đã check-in</p>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-semibold">{checkedInStatistics.notCheckedIn}</div>
                        <p className="text-sm text-muted-foreground">Chưa check-in</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Doanh thu theo loại vé
                  </CardTitle>
                  <CardDescription>
                    Phân tích doanh thu và số lượng vé theo từng loại
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueByClass.length > 0 ? (
                      revenueByClass.map(ticketClass => (
                        <div key={ticketClass.ticketClassId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="font-medium">{ticketClass.ticketClassName}</div>
                              <div className="text-xs text-muted-foreground">
                                {ticketClass.ticketsSold} vé đã bán
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(ticketClass.totalRevenue)}</div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round((ticketClass.ticketsSold / getTotalSoldTickets()) * 100)}% tổng số vé
                              </div>
                            </div>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ 
                                width: `${Math.round((ticketClass.ticketsSold / getTotalSoldTickets()) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      // Hiển thị dựa trên showInfo nếu không có dữ liệu revenueByClass
                      showInfo?.tickets.map(ticket => (
                        <div key={ticket.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="font-medium">{ticket.type}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatCurrency(ticket.price)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{ticket.sold || 0}/{ticket.available}</div>
                              <div className="text-xs text-muted-foreground">
                                {ticket.available > 0 ? Math.round(((ticket.sold || 0) / ticket.available) * 100) : 0}%
                              </div>
                            </div>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ 
                                width: `${ticket.available > 0 ? Math.round(((ticket.sold || 0) / ticket.available) * 100) : 0}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}

                    <div className="pt-6 mt-6 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Tổng doanh thu:</span>
                        <span className="font-bold text-xl">{formatCurrency(getTotalRevenue())}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-semibold">Tổng số vé đã bán:</span>
                        <span className="font-bold">{getTotalSoldTickets()} vé</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-semibold">Tỷ lệ bán vé:</span>
                        <span className="font-bold">{getSoldPercentage()}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TicketManagementPage;
