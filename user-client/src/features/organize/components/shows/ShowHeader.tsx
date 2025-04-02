import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, Clock, Edit, Trash } from "lucide-react";
import { Badge } from "@/commons/components/badge";
import { Button } from "@/commons/components/button";
import { ShowSaleStatus } from "../../internal-types/organize.type";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/commons/components/tooltip";

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
        return <Badge variant="success" className="h-6">Có thể đặt vé</Badge>;
      case "sold_out":
        return <Badge variant="destructive" className="h-6">Hết vé</Badge>;
      case "upcoming":
        return <Badge variant="outline" className="h-6">Sắp mở bán</Badge>;
      case "ended":
        return <Badge variant="secondary" className="h-6">Đã diễn ra</Badge>;
      default:
        return <Badge variant="outline" className="h-6">{saleStatus}</Badge>;
    }
  };

  const isEnded = show.saleStatus === "ended";

  return (
    <div className="flex items-center justify-between w-full gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center flex-1 gap-1 sm:gap-3">
        <div className="flex items-center min-w-[200px] w-[180px] sm:border-r sm:pr-2">
          <Calendar className="h-4 w-4 text-primary flex-shrink-0 mr-1.5" />
          <span className="font-medium truncate">{formatDate(show.date)}</span>
        </div>
        <div className="flex items-center sm:min-w-[80px]">
          <Clock className="h-4 w-4 text-primary flex-shrink-0 mr-1.5" />
          <span>{show.time}</span>
        </div>
        <div className="hidden sm:block ml-auto">
          {getStatusBadge(show.saleStatus)}
        </div>
      </div>
      
      <div className="flex sm:hidden mr-auto">
        {getStatusBadge(show.saleStatus)}
      </div>
      
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={(e) => onEdit(e, show.id)}
              disabled={isEnded}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isEnded ? "Không thể chỉnh sửa" : "Chỉnh sửa"}</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => onDelete(e, show.id)}
              disabled={isEnded}
            >
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isEnded ? "Không thể xóa" : "Xóa"}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
