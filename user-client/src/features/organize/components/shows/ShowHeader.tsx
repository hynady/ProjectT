import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, Clock, Edit, Trash } from "lucide-react";
import { Badge } from "@/commons/components/badge";
import { Button } from "@/commons/components/button";
import { ShowSaleStatus } from "../../internal-types/organize.type";

interface ShowHeaderProps {
  show: {
    id: string;
    date: string;
    time: string;
    saleStatus: ShowSaleStatus;
    tickets: {
      id: string;
      type: string;
      price: number;
      available: number;
      sold?: number;
    }[];
  };
  onEdit: (e: React.MouseEvent, showId: string) => void;
  onDelete: (e: React.MouseEvent, showId: string) => void;
}

export const ShowHeader = ({ show, onEdit, onDelete }: ShowHeaderProps) => {
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "EEEE, dd/MM/yyyy", { locale: vi });
  };

  const getStatusBadge = (saleStatus: ShowSaleStatus) => {
    switch (saleStatus) {
      case "on_sale":
        return <Badge variant="success">Có thể đặt vé</Badge>;
      case "sold_out":
        return <Badge variant="destructive">Hết vé</Badge>;
      case "upcoming":
        return <Badge variant="outline">Sắp mở bán</Badge>;
      case "ended":
        return <Badge variant="secondary">Đã diễn ra</Badge>;
      default:
        return <Badge variant="outline">{saleStatus}</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatDate(show.date)}</span>
          <Clock className="h-4 w-4 ml-2 text-muted-foreground" />
          <span>{show.time}</span>
        </div>
        <div className="flex items-center mt-1 gap-3">
          <div>{getStatusBadge(show.saleStatus)}</div>
          <span className="text-sm text-muted-foreground">
            {show.tickets.length} loại vé
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-1 mr-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => onEdit(e, show.id)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => onDelete(e, show.id)}
        >
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};
