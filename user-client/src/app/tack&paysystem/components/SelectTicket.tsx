// src/components/booking/SelectTicket.tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {EventDetail} from "@/types";

interface SelectTicketProps {
  event: EventDetail;
  onSelectShow: (showId: string) => void;
  onSelectTickets: (tickets: {type: string; quantity: number}[]) => void;
}

export function SelectTicket({ event, onSelectShow, onSelectTickets }: SelectTicketProps) {
  const [selectedShow, setSelectedShow] = useState<string>('');
  const [selectedTickets, setSelectedTickets] = useState<{[key: string]: number}>({});

  const handleShowChange = (showId: string) => {
    setSelectedShow(showId);
    onSelectShow(showId);
  };

  const handleTicketChange = (type: string, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [type]: quantity
    }));

    const tickets = Object.entries({
      ...selectedTickets,
      [type]: quantity
    }).map(([type, quantity]) => ({ type, quantity }));

    onSelectTickets(tickets);
  };

  const currentShow = event.shows.find(show => show.id === selectedShow);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Chọn buổi diễn</h3>
        <Select value={selectedShow} onValueChange={handleShowChange}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn buổi diễn" />
          </SelectTrigger>
          <SelectContent>
            {event.shows.map((show) => (
              <SelectItem key={show.id} value={show.id}>
                {show.date} - {show.time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentShow && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Chọn vé</h3>
          <div className="space-y-4">
            {currentShow.prices.map((ticket) => (
              <Card key={ticket.type}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{ticket.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.price.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Còn {ticket.available} vé
                    </p>
                  </div>
                  <Select
                    value={selectedTickets[ticket.type]?.toString() || '0'}
                    onValueChange={(value) => handleTicketChange(ticket.type, parseInt(value))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="0" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: Math.min(ticket.available, 10) + 1}).map((_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}