// src/features/my-ticket/MyTicketsPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/commons/components/input.tsx';
import { Button } from '@/commons/components/button.tsx';
import { Search, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/commons/components/select.tsx';
import { format } from 'date-fns';
import { useTickets } from "@/features/my-ticket/hooks/useTickets.tsx";
import { TicketList } from "@/features/my-ticket/blocks/TicketList.tsx";
import { TicketSkeleton } from "@/features/my-ticket/skeletons/TicketSkeleton.tsx";
import { ScrollToTop } from "@/commons/blocks/ScrollToTop.tsx";

export const MyTicketsPage = () => {
  const navigate = useNavigate();
  const {
    activeTickets,
    usedTickets,
    loading,
    error,
    hasLoadedUsedTickets,
    loadUsedTickets,
    refreshTickets
  } = useTickets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Nếu đã load usedTickets, refresh cả active và used tickets
      // Nếu chưa load usedTickets, chỉ refresh active tickets
      if (hasLoadedUsedTickets) {
        await Promise.all([refreshTickets(), loadUsedTickets()]);
      } else {
        await refreshTickets();
      }
    } catch (error) {
      console.error("Lỗi khi làm mới dữ liệu:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Give visual feedback
    }
  };

  if (loading && !isRefreshing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <TicketSkeleton />
      </div>
    );
  }

  if (error && !activeTickets.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-destructive text-xl mb-4">Lỗi: {error}</div>
        <Button variant="outline" onClick={handleRefresh}>
          Thử lại
        </Button>
      </div>
    );
  }

  // Directly assign tickets without filtering by user
  const userActiveTickets = activeTickets;
  const userUsedTickets = usedTickets;

  // Get the next upcoming event
  const nextEvent = userActiveTickets.sort(
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

          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"/>
                <Input
                  placeholder="Tìm kiếm theo tên sự kiện hoặc địa điểm..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Lọc theo"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vé</SelectItem>
                  <SelectItem value="upcoming">Sắp tới</SelectItem>
                  <SelectItem value="past">Đã diễn ra</SelectItem>
                  <SelectItem value="today">Hôm nay</SelectItem>
                </SelectContent>
              </Select>
            </div>            
          </div>

          <div className="relative">
            <TicketList
              activeTickets={userActiveTickets}
              usedTickets={userUsedTickets}
              hasLoadedUsedTickets={hasLoadedUsedTickets}
              onLoadUsedTickets={loadUsedTickets}
              searchQuery={searchQuery}
              filterType={filterType}
            />

            {userActiveTickets.length === 0 && !loading && !hasLoadedUsedTickets && (
              <div className="text-center py-12">
                <p className="text-lg font-semibold mb-2">Không có vé nào đang hoạt động</p>
                <p className="text-muted-foreground mb-4">
                  Bạn có thể kiểm tra vé đã dùng hoặc khám phá sự kiện mới
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={() => loadUsedTickets()}>
                    Xem vé đã dùng
                  </Button>
                  <Button onClick={() => navigate('/')}>Khám phá sự kiện</Button>
                </div>
              </div>
            )}

            {userActiveTickets.length === 0 && hasLoadedUsedTickets && userUsedTickets.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-lg font-semibold mb-2">Không có vé nào</p>
                <p className="text-muted-foreground mb-4">
                  Bạn chưa mua vé cho bất kỳ sự kiện nào. Hãy khám phá sự kiện và mua vé ngay!
                </p>
                <Button onClick={() => navigate('/')}>Khám phá sự kiện</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollToTop>
  );
};

export default MyTicketsPage;