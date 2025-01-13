// src/components/booking/SelectShow.tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {EventDetail} from "@/types";

interface SelectShowProps {
  event: EventDetail;
  onSelectShow: (showId: string) => void;
}

export function SelectShow({ event, onSelectShow }: SelectShowProps) {
  const [selectedShow, setSelectedShow] = useState<string>('');

  const handleShowSelect = (showId: string) => {
    setSelectedShow(showId);
    onSelectShow(showId);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Chọn buổi diễn</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {event.shows.map((show) => (
          <Card
            key={show.id}
            className={`cursor-pointer transition-all ${
              selectedShow === show.id
                ? 'border-primary ring-2 ring-primary ring-opacity-50'
                : 'hover:border-primary'
            }`}
            onClick={() => handleShowSelect(show.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{show.date}</p>
                  <p className="text-sm text-muted-foreground">{show.time}</p>
                  <p className="text-sm text-muted-foreground">Thời lượng: {show.duration} phút</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Giá từ</p>
                  <p className="font-medium text-primary">
                    {Math.min(...show.prices.map(p => p.price)).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}