// components/TicketSelection.tsx
import {Card, CardContent} from '@/commons/components/card.tsx';
import {Button} from '@/commons/components/button.tsx';
import {Input} from '@/commons/components/input.tsx';
import { ScrollToTop } from '@/commons/blocks/ScrollToTop.tsx';
import { TicketType } from '@/features/booking/internal-types/booking.type';

interface TicketSelectionProps {
  tickets: TicketType[];
  onUpdateTickets: (ticket: TicketType, quantity: number) => void;
  selectedTickets: {
    id: string;
    type: string;
    quantity: number;
    price: number;
  }[];
}

export const TicketSelection = ({tickets, onUpdateTickets, selectedTickets}: TicketSelectionProps) => {

  const getQuantity = (ticketId: string) => {
    const selected = selectedTickets.find(t => t.id === ticketId);
    return selected?.quantity || 0;
  };

  const handleQuantityChange = (ticket: TicketType, value: number) => {
    if (value >= 0 && value <= ticket.available) {
      onUpdateTickets(ticket, value);
    }
  };

  return (
    <ScrollToTop>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-4">
              <div className="flex sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{ticket.type}</p>
                    <p className="text-sm text-gray-500">{ticket.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>

                  <p className="text-xs text-gray-400">
                    Còn {ticket.available} vé
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(
                      ticket,
                      getQuantity(ticket.id) - 1
                    )}
                    disabled={getQuantity(ticket.id) <= 0}
                  >
                    -
                  </Button>

                  <Input
                    className="w-16 text-center"
                    value={getQuantity(ticket.id)}
                    readOnly
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(
                      ticket,
                      getQuantity(ticket.id) + 1
                    )}
                    disabled={getQuantity(ticket.id) >= ticket.available}
                  >
                    +
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollToTop>
  );
};