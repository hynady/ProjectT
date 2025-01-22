// components/TicketSelection.tsx
import {Card, CardContent} from '@/components/ui/card.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Input} from '@/components/ui/input.tsx';
import { ScrollToTop } from '@/components/global/ScrollToTop.tsx';

export interface TicketType {
  type: string;
  price: string;
  available: number;
}

interface TicketSelectionProps {
  tickets: TicketType[];
  onUpdateTickets: (ticket: TicketType, quantity: number) => void;
  selectedTickets: {
    type: string;
    quantity: number;
    price: string;
  }[];
}

export const TicketSelection = ({tickets, onUpdateTickets, selectedTickets}: TicketSelectionProps) => {

  const getQuantity = (ticketType: string) => {
    const selected = selectedTickets.find(t => t.type === ticketType);
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
          <Card key={ticket.type}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{ticket.type}</p>
                  <p className="text-sm text-gray-500">{ticket.price}</p>
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
                      getQuantity(ticket.type) - 1
                    )}
                    disabled={getQuantity(ticket.type) <= 0}
                  >
                    -
                  </Button>

                  <Input
                    className="w-16 text-center"
                    value={getQuantity(ticket.type)}
                    readOnly
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(
                      ticket,
                      getQuantity(ticket.type) + 1
                    )}
                    disabled={getQuantity(ticket.type) >= ticket.available}
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