import { Plus } from "lucide-react";
import { Button } from "@/commons/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/commons/components/accordion";
import { ShowHeader } from "./ShowHeader";
import { TicketItem } from "./TicketItem";
import { ShowInfo } from "../../internal-types/show.type";

interface ShowListProps {
  shows: ShowInfo[];
  onEditShow: (e: React.MouseEvent, showId: string) => void;
  onDeleteShow: (e: React.MouseEvent, showId: string) => void;
  onAddTicket: (showId: string) => void;
  onEditTicket: (ticketId: string) => void;
  onDeleteTicket: (ticketId: string) => void;
}

export const ShowList = ({
  shows,
  onEditShow,
  onDeleteShow,
  onAddTicket,
  onEditTicket,
  onDeleteTicket
}: ShowListProps) => {
  return (
    <div className="space-y-4 py-1">
      <Accordion type="multiple" className="w-full space-y-3">
        {shows.map((show) => (
          <AccordionItem 
            key={show.id} 
            value={show.id} 
            className="border rounded-md overflow-hidden shadow-sm"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline [&[data-state=open]]:bg-muted/20">
              <ShowHeader 
                show={show} 
                onEdit={onEditShow} 
                onDelete={onDeleteShow}
              />
            </AccordionTrigger>
            <AccordionContent className="border-t">
              <div className="p-4 pt-3">
                <div className="flex items-center justify-between py-2">
                  <h4 className="text-sm font-medium">Danh sách vé:</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 h-8"
                    onClick={() => onAddTicket(show.id)}
                  >
                    <Plus className="h-3 w-3" /> Thêm vé
                  </Button>
                </div>
                <div className="space-y-2">
                  {show.tickets.map((ticket) => (
                    <TicketItem 
                      key={ticket.id}
                      ticket={ticket}
                      onEdit={onEditTicket}
                      onDelete={onDeleteTicket}
                    />
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
