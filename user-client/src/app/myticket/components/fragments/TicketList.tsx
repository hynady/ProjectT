// src/components/MyTickets/TicketList.tsx
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {motion, AnimatePresence} from 'framer-motion';
import {Calendar, Clock, Ticket, ChevronRight} from 'lucide-react';
import {format, isFuture, isPast, isToday} from 'date-fns';
import {TicketModal} from "@/app/myticket/components/fragments/TicketModal.tsx";


export interface Ticket {
  id: string;
  occaId: string;
  showId: string;
  typeId: string;
  purchaseDate: string;
  qrCode: string;
  purchasedBy: string;
  checkedInAt?: string;
}

export interface Occa {
  id: string;
  title: string;
  location: string;
  duration: string;
  address: string;
}

export interface TicketDisplay {
  ticket: Ticket;
  occa: Occa;
  show: Show;
  ticketType: TicketType;
}

export interface Show {
  id: string;
  occaId: string;
  date: string;
  time: string;
}

export interface TicketType {
  id: string;
  showId: string;
  type: string;
  price: number;
}

interface TicketListProps {
  activeTickets: TicketDisplay[];
  usedTickets: TicketDisplay[];
  hasLoadedUsedTickets: boolean;
  onLoadUsedTickets: () => void;
  searchQuery: string;
  filterType: string;
}

// Helper function to group tickets by Occa and Show
const groupTickets = (tickets: TicketDisplay[]) => {
  const groups = new Map<string, {
    occa: TicketDisplay['occa'],
    shows: Map<string, {
      show: TicketDisplay['show'],
      tickets: TicketDisplay[]
    }>
  }>();

  tickets.forEach(ticket => {
    const occaKey = ticket.occa.id;
    const showKey = ticket.show.id;

    if (!groups.has(occaKey)) {
      groups.set(occaKey, {
        occa: ticket.occa,
        shows: new Map()
      });
    }

    const occaGroup = groups.get(occaKey)!;
    if (!occaGroup.shows.has(showKey)) {
      occaGroup.shows.set(showKey, {
        show: ticket.show,
        tickets: []
      });
    }

    occaGroup.shows.get(showKey)!.tickets.push(ticket);
  });

  return groups;
};

const getTicketStatus = (ticket: TicketDisplay) => {
  if (ticket.ticket.checkedInAt) {
    return 'Đã Check-in';
  }
  return isPast(new Date(ticket.show.date)) ? 'Đã hết hạn' : 'Hoạt động';
};

export const TicketList = ({
                             activeTickets,
                             usedTickets,
                             hasLoadedUsedTickets,
                             onLoadUsedTickets,
                             searchQuery,
                             filterType
                           }: TicketListProps) => {
  const [selectedTicket, setSelectedTicket] = useState<TicketDisplay | null>(null);

  const filterTickets = (tickets: TicketDisplay[]) => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.occa.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.occa.location.toLowerCase().includes(searchQuery.toLowerCase());

      const ticketDate = new Date(ticket.show.date);
      const matchesFilter = filterType === 'all' ||
        (filterType === 'upcoming' && isFuture(ticketDate)) ||
        (filterType === 'past' && isPast(ticketDate)) ||
        (filterType === 'today' && isToday(ticketDate));

      return matchesSearch && matchesFilter;
    });
  };

  const filteredActiveTickets = filterTickets(activeTickets);
  const filteredUsedTickets = filterTickets(usedTickets);

  const groupedActiveTickets = groupTickets(filteredActiveTickets);
  const groupedUsedTickets = groupTickets(filteredUsedTickets);

  const renderTicketGroup = (groupedTickets: ReturnType<typeof groupTickets>, isUsed: boolean) => (
    <Accordion type="multiple" className="space-y-4">
      {Array.from(groupedTickets.entries()).map(([occaId, occaGroup]) => (
        <AccordionItem
          key={occaId}
          value={occaId}
          className={`border rounded-lg bg-card ${isUsed ? 'opacity-60' : ''}`}
        >
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-primary"/>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">{occaGroup.occa.title}</h3>
                  <p className="text-sm text-muted-foreground">{occaGroup.occa.location}</p>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-6 pb-4 space-y-4">
              {Array.from(occaGroup.shows.entries()).map(([showId, showGroup]) => (
                <div key={showId} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4"/>
                    <span>{format(new Date(showGroup.show.date), 'PPP')}</span>
                    <Clock className="w-4 h-4 ml-2"/>
                    <span>{showGroup.show.time}</span>
                  </div>
                  <div className="grid gap-3">
                    {showGroup.tickets.map((ticket) => (
                      <motion.div
                        key={ticket.ticket.id}
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                      >
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="w-full p-4 rounded-lg border bg-card hover:bg-accent transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <Badge variant={ticket.ticketType.type === 'VIP' ? 'default' : 'secondary'}>
                              {ticket.ticketType.type === 'VIP' ? 'VIP' : 'Thường'}
                            </Badge>
                            <span className="text-sm font-medium">{ticket.ticketType.price}₫</span>
                            <Badge variant={
                              ticket.ticket.checkedInAt ? 'default' :
                                isPast(new Date(ticket.show.date)) ? 'destructive' : 'outline'
                            }>
                              {getTicketStatus(ticket)}
                            </Badge>
                          </div>
                          <ChevronRight
                            className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
                          />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Vé đang hoạt động */}
        {renderTicketGroup(groupedActiveTickets, false)}

        {/* Vé đã dùng */}
        {!hasLoadedUsedTickets ? (
          filteredActiveTickets.length > 0 && (
            <div className="text-center py-6">
              <Button
                variant="outline"
                onClick={onLoadUsedTickets}
                className="mx-auto"
              >
                Xem vé đã dùng
              </Button>
            </div>
          )
        ) : (
          filteredUsedTickets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Vé đã dùng</h3>
              {renderTicketGroup(groupedUsedTickets, true)}
            </div>
          )
        )}
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <TicketModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </AnimatePresence>

      {filteredActiveTickets.length === 0 && (!hasLoadedUsedTickets || filteredUsedTickets.length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy vé</p>
        </div>
      )}
    </>
  );
};