// src/features/my-ticket/blocks/TicketList.tsx
import { useState, useCallback, memo } from 'react';
import { Badge } from '@/commons/components/badge.tsx';
import { Button } from '@/commons/components/button.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronRight, MoreHorizontal } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { TicketModal } from "@/features/my-ticket/blocks/TicketModal.tsx";
import { TicketDisplayUnit } from '@/features/my-ticket/internal-types/ticket.type';
import { PageResponse } from '@/features/my-ticket/services/ticket.service';
import { vi } from 'date-fns/locale';

const getTicketStatus = (ticket: TicketDisplayUnit) => {
  if (ticket.ticket.checkedInAt) {
    return 'Đã Check-in';
  }
  const showDateTime = new Date(`${ticket.show.date}T${ticket.show.time}`);
  const oneDayAfterShow = new Date(showDateTime.getTime() + 24 * 60 * 60 * 1000);
  return isPast(oneDayAfterShow) ? 'Đã quá hạn thanh toán' : 'Hoạt động';
};

interface TicketListProps {
  tickets: TicketDisplayUnit[];
  pageInfo?: PageResponse<TicketDisplayUnit> | null;
  onLoadMore?: () => void;
  loading?: boolean;
  loadingMore?: boolean;
}

// Memoize individual ticket card to prevent unnecessary re-renders
const TicketCard = memo(({ ticket, onSelect }: { 
  ticket: TicketDisplayUnit; 
  onSelect: (ticket: TicketDisplayUnit) => void;
}) => {
  const handleSelect = useCallback(() => {
    onSelect(ticket);
  }, [ticket, onSelect]);

  return (
    <motion.div
      key={ticket.ticket.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full"
    >
      <button
        onClick={handleSelect}
        className="w-full p-6 rounded-lg border bg-card hover:bg-accent transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 text-left space-y-3">
            {/* Event Title */}
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg text-foreground">
                {ticket.occa.title}
              </h3>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            
            {/* Event Details */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{ticket.occa.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(ticket.show.date), 'dd/MM/yyyy', { locale: vi })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{ticket.show.time}</span>
              </div>
            </div>
            
            {/* Ticket Details */}
            <div className="flex items-center gap-3">
              <Badge variant={ticket.ticketType.type.toLowerCase().includes('vip') ? 'default' : 'secondary'}>
                {ticket.ticketType.type}
              </Badge>
              <span className="text-sm font-medium text-foreground">
                {ticket.ticketType.price.toLocaleString('vi-VN')}đ
              </span>
                <Badge variant={
                getTicketStatus(ticket) === 'Đã Check-in' ? 'default' :
                  getTicketStatus(ticket) === 'Đã quá hạn thanh toán' ? 'destructive' : 'outline'
                }>
                {getTicketStatus(ticket)}
              </Badge>
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
});

TicketCard.displayName = 'TicketCard';

export const TicketList = memo(({ tickets, pageInfo, onLoadMore, loading = false, loadingMore = false }: TicketListProps) => {
  const [selectedTicket, setSelectedTicket] = useState<TicketDisplayUnit | null>(null);

  const handleTicketSelect = useCallback((ticket: TicketDisplayUnit) => {
    setSelectedTicket(ticket);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTicket(null);
  }, []);

  return (
    <>
      <div className="space-y-4">
        {tickets.length > 0 ? (
          <>
            <div className="grid gap-4">
              {tickets.map(ticket => (
                <TicketCard 
                  key={ticket.ticket.id}
                  ticket={ticket} 
                  onSelect={handleTicketSelect}
                />
              ))}
            </div>
            
            {/* Load More Button */}
            {pageInfo && !pageInfo.last && onLoadMore && (
              <div className="flex justify-center pt-6">
                <Button 
                  variant="outline" 
                  onClick={onLoadMore}
                  disabled={loading || loadingMore}
                  className="min-w-[120px]"
                >
                  {loadingMore ? (
                    <>
                      <MoreHorizontal className="w-4 h-4 mr-2 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    'Xem thêm'
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không có vé nào để hiển thị</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <TicketModal
            ticket={selectedTicket}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </>
  );
});

TicketList.displayName = 'TicketList';