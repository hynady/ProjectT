// src/components/booking/SelectTickets.tsx
import { useState } from 'react';
import { ShowDetail } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SelectTicketsProps {
  show: ShowDetail;
  onSelectTickets: (tickets: {type: string; quantity: number}[]) => void;
}

export function SelectTickets({ show, onSelectTickets }: SelectTicketsProps) {
  const [selectedTickets, setSelectedTickets] = useState<{[key: string]: number}>({});

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Chọn hạng vé</h2>
      <div className="space-y-4">
        {show.prices.map((ticket) => (
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
  );
}