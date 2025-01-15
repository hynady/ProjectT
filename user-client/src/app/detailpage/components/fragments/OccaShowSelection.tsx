import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';

export interface OccaShowUnit {
  date: string;
  time: string;
  prices: {
    type: string;
    price: number;
    available: number;
  }[];
}

interface OccaShowSelectionProps {
  shows: OccaShowUnit[];
  organizer: string;
}

export const OccaShowSelection = ({ shows, organizer }: OccaShowSelectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-4">
      <div className="bg-card rounded-xl p-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Chọn buổi diễn</h2>
        <Accordion type="single" collapsible>
          {shows.map((show, index) => (
            <AccordionItem key={index} value={`show-${index}`}>
              <AccordionTrigger>
                {show.date} - {show.time}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {show.prices.map((ticket, ticketIndex) => (
                    <Card
                      key={ticketIndex}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                    >
                      <div>
                        <h3 className="font-semibold text-primary">{ticket.type}</h3>
                        <p className="text-muted-foreground">
                          {ticket.price.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Còn {ticket.available} vé
                        </p>
                      </div>
                      <Button>Chọn</Button>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <Button className="w-full mt-6" size="lg" onClick={()=>navigate("booking")}>
          Đặt vé ngay
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Vé được bán bởi {organizer}
        </p>
      </div>
    </div>
  );
};