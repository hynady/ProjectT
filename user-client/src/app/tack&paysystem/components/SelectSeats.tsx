// src/components/booking/SelectSeats.tsx
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface SelectSeatsProps {
  show: ShowDetail;
  onSelectSeats: (seats: string[]) => void;
}

export function SelectSeats({ show, onSelectSeats }: SelectSeatsProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const handleSeatClick = (seatId: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
    onSelectSeats(selectedSeats);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Chọn ghế ngồi</h2>
      <div className="space-y-8">
        {show.prices.map((priceType) => (
          <div key={priceType.type} className="space-y-4">
            <h3 className="text-lg font-medium">{priceType.type}</h3>
            <div className="grid grid-cols-10 gap-2">
              {priceType.seats?.map((seat) => (
                <button
                  key={seat.id}
                  className={`w-10 h-10 rounded-md text-xs font-medium 
                    ${seat.status === 'available'
                    ? selectedSeats.includes(seat.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-primary/20'
                    : 'bg-destructive cursor-not-allowed'
                  }`}
                  disabled={seat.status !== 'available'}
                  onClick={() => handleSeatClick(seat.id)}
                >
                  {seat.row}-{seat.number}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedSeats.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium">Ghế đã chọn</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSeats.map(seatId => (
              <Badge key={seatId} variant="secondary" className="px-3 py-1 rounded-full text-sm">
                {seatId}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Cập nhật lại interface
export interface Seat {
  id: string;
  status: 'available' | 'booked';
  row: string;
  number: string;
}

export interface PriceType {
  type: string;
  price: number;
  available: number;
  seats?: Seat[];
  description?: string;
  benefits?: string[];
}

export interface ShowDetail {
  id: string;
  dateString: string;
  timeString: string;
  durationString: string;
  trackSeats: boolean;
  prices: PriceType[];
}