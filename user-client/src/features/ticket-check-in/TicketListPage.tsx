import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/commons/components/button';
import { useNavigate } from 'react-router-dom';
import { TicketsTable } from '@/features/organize/components/tickets/TicketsTable';
import { ticketCheckInService } from './ticket-check-in.service';
import { toast } from '@/commons/hooks/use-toast';
import { TicketCheckInLayout } from './TicketCheckInLayout';
import { Input } from '@/commons/components/input';
import { Search, CheckCircle, XCircle, Ticket, Calendar, Clock, User, Mail, Phone } from 'lucide-react';
import { TicketInfo } from '@/features/organize/internal-types/ticket.type';
import { useDataTable } from '@/commons/hooks/use-data-table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/commons/components/alert-dialog";
import { formatCurrency } from '@/utils/formatters';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/commons/components/card';
import { Separator } from '@/commons/components/separator';

export const TicketListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketInfo | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const showAuthCode = localStorage.getItem('showAuthCode');
    const expiryTime = localStorage.getItem('showAuthExpiry');

    if (!showAuthCode || !expiryTime || new Date(expiryTime) < new Date()) {
      navigate('/ticket-check-in');
      return;
    }

    setAuthCode(showAuthCode);
  }, [navigate]);  // Data fetching function for useDataTable
  const fetchData = useCallback(async (params: { 
    page: number;
    size: number;
    sort?: string;
    direction?: 'asc' | 'desc';
  }) => {
    if (!authCode) {
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

    try {
      const response = await ticketCheckInService.getTicketsByAuthCode(authCode, {
        page: params.page,
        size: params.size,
        sort: params.sort || 'purchasedAt',
        direction: params.direction
      });

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
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi hệ thống',
        description: 'Có lỗi xảy ra khi tải danh sách vé. Vui lòng thử lại sau.',
      });
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
  }, [authCode]);
  // Configure datatable hook
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
  } = useDataTable<TicketInfo, string>({
    defaultSortField: 'purchasedAt',
    defaultSortDirection: 'desc',
    fetchData,
    skipInitialFetch: !authCode // Skip initial fetch if no authCode
  });

  // Search debounce
  useEffect(() => {
    if (!authCode) return;
    
    const timeoutId = setTimeout(() => {
      handleSearchChange(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearchChange, authCode]);

  // Set showName and showTime in localStorage when tickets are loaded
  useEffect(() => {
    if (tickets.length > 0) {
      const firstTicket = tickets[0];
      localStorage.setItem('showName', firstTicket.occaTitle);
      localStorage.setItem('showTime', `${firstTicket.showDate} ${firstTicket.showTime}`);
    }
  }, [tickets]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('showAuthCode');
    localStorage.removeItem('showAuthExpiry');
    localStorage.removeItem('showName');
    localStorage.removeItem('showTime');
    navigate('/ticket-check-in');
  };

  // Navigate to ticket scan page
  const handleScanPage = () => {
    navigate('/ticket-check-in/scan');
  };

  // Handle check-in ticket
  const handleCheckInTicket = async (ticketId: string) => {
    if (!authCode) return;
    
    setIsProcessing(true);
    try {
      await ticketCheckInService.checkInTicket(authCode, ticketId);
      toast({
        title: 'Check-in thành công',
        description: 'Vé đã được xác nhận thành công',
      });
      // Refresh data to update the checked-in status
      refreshData();    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message
        : (error as { response?: { data?: { message: string } } })?.response?.data?.message || 'Vé không hợp lệ hoặc đã được sử dụng';
      
      toast({
        variant: 'destructive',
        title: 'Check-in thất bại',
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
      setIsCheckInDialogOpen(false);
      setIsDetailsDialogOpen(false);
      setSelectedTicket(null);
    }
  };

  if (!authCode) {
    return null; // Or a loading state
  }    // Format datetime string to readable format
    const formatDateTime = (dateTimeString: string): string => {
        if (!dateTimeString) return '';
        try {
            return format(parseISO(dateTimeString), 'dd/MM/yyyy HH:mm', { locale: vi });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateTimeString;
        }
    };

  return (
    <TicketCheckInLayout>
      <div className="space-y-4">
        {/* Header with title and actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Danh sách vé</h2>
            {tickets.length > 0 && (
              <div className="mt-2 text-muted-foreground">
                <div className="font-medium">{tickets[0].occaTitle}</div>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(parseISO(tickets[0].showDate), 'dd/MM/yyyy', { locale: vi })}</span>
                  <span>•</span>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{tickets[0].showTime}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleScanPage}>
              Quét mã QR
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Đổi mã
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
            sortField={sortField || 'purchasedAt'}
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
            onViewTicketDetails={(ticketId) => {
              const ticket = tickets.find(t => t.ticketId === ticketId);
              if (ticket) {
                setSelectedTicket(ticket);
                setIsDetailsDialogOpen(true);
              }
            }}
          />
        </div>
      </div>

      {/* Ticket Details Dialog */}
      <AlertDialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Chi tiết vé</AlertDialogTitle>
            <AlertDialogDescription>
              Thông tin chi tiết về vé đã chọn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedTicket && (
            <div className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    {selectedTicket.occaTitle}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDateTime(selectedTicket.showDate)}
                      <span className="mx-1">•</span>
                      <Clock className="h-4 w-4" />
                      {selectedTicket.showTime}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Loại vé</h4>
                      <p className="text-base font-medium">{selectedTicket.ticketType}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Giá vé</h4>
                      <p className="text-base font-medium">{formatCurrency(selectedTicket.ticketPrice)}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Thông tin người nhận</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p>{selectedTicket.recipientName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p>{selectedTicket.recipientEmail}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p>{selectedTicket.recipientPhone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Thông tin mua vé</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Mã vé</span>
                        <span className="font-medium">{selectedTicket.ticketId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Mã hóa đơn</span>
                        <span className="font-medium">{selectedTicket.invoiceId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Mã thanh toán</span>
                        <span className="font-medium">{selectedTicket.paymentId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Ngày mua</span>
                        <span className="font-medium">{formatDateTime(selectedTicket.purchasedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Trạng thái check-in</h4>
                    <div className="flex items-center gap-2">
                      {selectedTicket.checkedInAt ? (
                        <>
                          <div className="flex items-center gap-1.5 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Đã check-in</span>
                          </div>
                          <span className="text-sm text-muted-foreground ml-2">
                            vào lúc {formatDateTime(selectedTicket.checkedInAt)}
                          </span>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-orange-500">
                          <XCircle className="h-5 w-5" />
                          <span className="font-medium">Chưa check-in</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                    Đóng
                  </Button>
                  {!selectedTicket.checkedInAt && (
                    <Button 
                      onClick={() => {
                        setIsDetailsDialogOpen(false);
                        setIsCheckInDialogOpen(true);
                      }}
                    >
                      Check-in
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* Check-in Confirmation Dialog */}
      <AlertDialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận check-in</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTicket && (
                <>
                  Bạn có chắc chắn muốn check-in vé này?
                  <div className="mt-4 font-medium">
                    <div>Sự kiện: {selectedTicket.occaTitle}</div>
                    <div>Loại vé: {selectedTicket.ticketType}</div>
                    <div>Người nhận: {selectedTicket.recipientName}</div>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isProcessing}
              onClick={(e) => {
                e.preventDefault(); // Prevent default to handle manually
                if (selectedTicket) {
                  handleCheckInTicket(selectedTicket.ticketId);
                }
              }}
            >
              {isProcessing ? 'Đang xử lý...' : 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TicketCheckInLayout>
  );
};

export default TicketListPage;
