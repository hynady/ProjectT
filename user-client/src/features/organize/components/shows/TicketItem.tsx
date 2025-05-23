import { Banknote, Edit, MoreHorizontal, Trash, Users, Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/commons/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/commons/components/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/commons/components/tooltip";

interface TicketItemProps {
  ticket: {
    id: string;
    type: string;
    price: number;
    available: number;
    sold?: number;
  };
  onEdit: (ticketId: string) => void;
  onDelete: (ticketId: string) => void;
  isReadOnly?: boolean;
}

export const TicketItem = ({ ticket, onEdit, onDelete, isReadOnly = false }: TicketItemProps) => {
  return (
    <div 
      className="bg-muted/30 p-3 rounded-md flex items-center justify-between hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-1.5 rounded-md hidden sm:flex">
          <TicketIcon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="font-medium">{ticket.type}</div>
          <div className="text-sm flex items-center mt-1">
            <Banknote className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>{ticket.price.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="flex items-center justify-end text-sm">
            <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>
              {ticket.sold !== undefined ? (
                <>{ticket.sold}/{ticket.available + ticket.sold}</>
              ) : (
                <>{ticket.available} vé</>
              )}
            </span>
          </div>
          {ticket.sold !== undefined && (
            <div className="text-xs text-muted-foreground mt-1">
              {ticket.available} vé còn lại
            </div>
          )}
        </div>
        
        {!isReadOnly ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => onEdit(ticket.id)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(ticket.id)}
                className="gap-2 text-destructive"
              >
                <Trash className="h-4 w-4" />
                <span>Xóa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="opacity-50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-not-allowed">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Không thể chỉnh sửa</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};
