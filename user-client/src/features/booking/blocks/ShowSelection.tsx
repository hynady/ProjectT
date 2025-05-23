// components/ShowSelection.tsx
import {useState} from 'react';
import {format} from 'date-fns';
import {Card, CardContent} from '@/commons/components/card.tsx';
import {Button} from '@/commons/components/button.tsx';
import {vi} from "date-fns/locale";
import {ScrollToTop} from "@/commons/blocks/ScrollToTop.tsx";
import { OccaShowUnit } from '@/features/booking/internal-types/booking.type';


interface ShowSelectionProps {
  shows: OccaShowUnit[];
  onSelectShow: (show: { id: string; date: string; time: string }) => void;
  selectedShow: { id: string; date: string; time: string } | null;
}

export const ShowSelection = ({shows, onSelectShow, selectedShow}: ShowSelectionProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(selectedShow?.date || null);

  const uniqueDates = [...new Set(shows.map(show => show.date))];
  const showsByDate = shows.filter(show => show.date === selectedDate);

  return (
    <ScrollToTop>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {uniqueDates.map(date => (
            <Button
              key={date}
              variant={selectedDate === date ? "default" : "outline"}
              onClick={() => setSelectedDate(date)}
              className="w-full"
            >
              {format(new Date(date), 'EEEE, dd/MM/yyyy', {locale: vi})}
            </Button>
          ))}
        </div>

        {selectedDate && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {showsByDate.map((show) => (
              <Card
                key={show.time}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedShow?.time === show.time && selectedShow?.date === show.date
                    ? 'ring-2 ring-primary'
                    : 'hover:shadow-lg'
                }`}
              >
                <CardContent
                  className="p-4"
                  onClick={() => onSelectShow({id: show.id, date: show.date, time: show.time})}
                >
                  <p className="text-lg font-semibold">{show.time}</p>
                  <p className="text-sm text-gray-500">
                    {show.prices.length} loại vé
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ScrollToTop>
  );
};