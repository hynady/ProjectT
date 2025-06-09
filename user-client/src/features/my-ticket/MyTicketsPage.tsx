// src/features/my-ticket/MyTicketsPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/commons/components/input.tsx';
import { Button } from '@/commons/components/button.tsx';
import { Search, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/commons/components/tabs.tsx';
import { format } from 'date-fns';
import { useTickets } from "@/features/my-ticket/hooks/useTickets.tsx";
import { TicketList } from "@/features/my-ticket/blocks/TicketList.tsx";
import { TicketSkeleton } from "@/features/my-ticket/skeletons/TicketSkeleton.tsx";
import { ScrollToTop } from "@/commons/blocks/ScrollToTop.tsx";
import { TicketFilter } from '@/features/my-ticket/services/ticket.service';

export const MyTicketsPage = () => {
  const navigate = useNavigate();  const {
    tickets,
    loading,
    loadingMore,
    error,
    pageInfo,
    currentFilter,
    searchQuery,
    changeFilter,
    searchTickets,
    loadMoreTickets,
    refreshTickets
  } = useTickets();
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTickets();
    } catch (error) {
      console.error("Lỗi khi làm mới dữ liệu:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Give visual feedback
    }
  };

  const handleSearch = (query: string) => {
    searchTickets(query);
  };

  const handleTabChange = (value: string) => {
    changeFilter(value as TicketFilter);
  };

  if (loading && !isRefreshing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <TicketSkeleton />
      </div>
    );
  }

  if (error && !tickets.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-destructive text-xl mb-4">Lỗi: {error}</div>
        <Button variant="outline" onClick={handleRefresh}>
          Thử lại
        </Button>
      </div>
    );
  }

  // Get the next upcoming event from active tickets
  const activeTickets = tickets.filter(ticket => 
    !ticket.ticket.checkedInAt && new Date(ticket.show.date) > new Date()
  );
  
  const nextEvent = activeTickets.sort(
    (a, b) => new Date(a.show.date).getTime() - new Date(b.show.date).getTime()
  )[0];

  return (
    <ScrollToTop>
      <div className="max-w-screen-xl mx-auto min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Vé Của Tôi</h1>
              <p className="text-muted-foreground">
                Xem và quản lý vé sự kiện của bạn
              </p>
            </div>
            <Button 
              variant="outline" 
              className="sm:self-start flex-shrink-0" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
          
          {nextEvent && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg mb-6">
              <p className="text-sm font-medium">Sự kiện sắp tới</p>
              <p className="text-lg font-semibold">{nextEvent.occa.title}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(nextEvent.show.date), "PPP")} lúc {nextEvent.show.time}
              </p>
            </div>
          )}

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"/>
              <Input
                placeholder="Tìm kiếm theo tên sự kiện hoặc địa điểm..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={currentFilter} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ACTIVE">Vé đang hoạt động</TabsTrigger>
              <TabsTrigger value="USED">Vé đã sử dụng</TabsTrigger>
              <TabsTrigger value="ALL">Tất cả vé</TabsTrigger>
            </TabsList>            <TabsContent value="ACTIVE" className="mt-6">
              <TicketList 
                tickets={tickets} 
                pageInfo={pageInfo} 
                onLoadMore={loadMoreTickets}
                loading={loading}
                loadingMore={loadingMore}
              />
            </TabsContent>
            
            <TabsContent value="USED" className="mt-6">
              <TicketList 
                tickets={tickets} 
                pageInfo={pageInfo} 
                onLoadMore={loadMoreTickets}
                loading={loading}
                loadingMore={loadingMore}
              />
            </TabsContent>
            
            <TabsContent value="ALL" className="mt-6">
              <TicketList 
                tickets={tickets} 
                pageInfo={pageInfo} 
                onLoadMore={loadMoreTickets}
                loading={loading}
                loadingMore={loadingMore}
              />
            </TabsContent>
          </Tabs>

          {tickets.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-lg font-semibold mb-2">
                {currentFilter === 'ACTIVE' && 'Không có vé nào đang hoạt động'}
                {currentFilter === 'USED' && 'Không có vé nào đã sử dụng'}
                {currentFilter === 'ALL' && 'Không có vé nào'}
              </p>
              <p className="text-muted-foreground mb-4">
                {currentFilter === 'ACTIVE' && 'Bạn có thể kiểm tra vé đã dùng hoặc khám phá sự kiện mới'}
                {currentFilter === 'USED' && 'Bạn chưa có vé nào đã sử dụng'}
                {currentFilter === 'ALL' && 'Bạn chưa mua vé cho bất kỳ sự kiện nào. Hãy khám phá sự kiện và mua vé ngay!'}
              </p>
              <Button onClick={() => navigate('/')}>Khám phá sự kiện</Button>
            </div>
          )}
        </div>
      </div>
    </ScrollToTop>
  );
};

export default MyTicketsPage;