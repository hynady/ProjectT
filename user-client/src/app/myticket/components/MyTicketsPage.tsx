// components/MyTickets/MyTicketsPage.tsx
import {useState} from 'react';

import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Search} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {format} from 'date-fns';
import {useTickets} from "@/app/myticket/hooks/useTickets.tsx";
import {TicketList} from "@/app/myticket/components/fragments/TicketList.tsx";
import {TicketSkeleton} from "@/app/myticket/components/skeleton/TicketSkeleton.tsx";

const CURRENT_USER = 'hynady';
const CURRENT_DATE = new Date('2025-01-21 07:10:28');

export const MyTicketsPage = () => {
  const {
    activeTickets,
    usedTickets,
    loading,
    error,
    hasLoadedUsedTickets,
    loadUsedTickets
  } = useTickets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <TicketSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">Lỗi: {error}</div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Filter active tickets for the current user
  const userActiveTickets = activeTickets.filter(
    ticket => ticket.ticket.purchasedBy === CURRENT_USER
  );

  // Filter used tickets for the current user
  const userUsedTickets = usedTickets.filter(
    ticket => ticket.ticket.purchasedBy === CURRENT_USER
  );

  // Get the next upcoming event
  const nextEvent = userActiveTickets.sort(
    (a, b) => new Date(a.show.date).getTime() - new Date(b.show.date).getTime()
  )[0];

  return (
    <div className="max-w-screen-xl mx-auto min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Vé Của Tôi</h1>
          <p className="text-muted-foreground">
            Xem và quản lý vé sự kiện của bạn
          </p>
          {nextEvent && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg">
              <p className="text-sm font-medium">Sự kiện sắp tới</p>
              <p className="text-lg font-semibold">{nextEvent.occa.title}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(nextEvent.show.date), "PPP")} lúc{" "}
                {nextEvent.show.time}
              </p>
            </div>
          )}
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"/>
              <Input
                placeholder="Search events by name or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vé</SelectItem>
                <SelectItem value="upcoming">Sắp tới</SelectItem>
                <SelectItem value="past">Đã diễn ra</SelectItem>
                <SelectItem value="today">Hôm nay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ticket stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Vé đang hoạt động</p>
              <p className="text-2xl font-bold">{userActiveTickets.length}</p>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Vé đã sử dụng</p>
              <p className="text-2xl font-bold">{userUsedTickets.length}</p>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Sự kiện hôm nay</p>
              <p className="text-2xl font-bold">
                {userActiveTickets.filter(ticket =>
                  format(new Date(ticket.show.date), 'yyyy-MM-dd') ===
                  format(CURRENT_DATE, 'yyyy-MM-dd')
                ).length}
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Tháng này</p>
              <p className="text-2xl font-bold">
                {userActiveTickets.filter(ticket =>
                  new Date(ticket.show.date).getMonth() === CURRENT_DATE.getMonth()
                ).length}
              </p>
            </div>
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

          {userActiveTickets.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-lg font-semibold mb-2">No Active Tickets</p>
              <p className="text-muted-foreground mb-4">
                Bạn không có sự kiện nào sắp tới. Duyệt sự kiện để bắt đầu!
              </p>
              <Button>Browse Events</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};