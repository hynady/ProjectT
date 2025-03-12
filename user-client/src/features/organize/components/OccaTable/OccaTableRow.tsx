import { format } from "date-fns";
import { Calendar, Check, CheckCircle2, Clock, Eye, FileEdit, MoreHorizontal, Trash2 } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/commons/components/dropdown-menu";
import { Button } from "@/commons/components/button";
import { Badge } from "@/commons/components/badge";
import { TableCell, TableRow } from "@/commons/components/table";
import { OrganizerOccaUnit } from "../../internal-types/organize.type";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/commons/components/tooltip";

interface OccaTableRowProps {
  occa: OrganizerOccaUnit;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const OccaTableRow = ({ occa, onView, onEdit, onDelete }: OccaTableRowProps) => {
  // Helper function to render truncated text with tooltip
  const TruncatedText = ({ text, className = "" }: { text: string, className?: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`max-w-full overflow-hidden text-ellipsis whitespace-nowrap ${className}`}>{text}</div>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="max-w-xs">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <TableRow key={occa.id} className="group">
      <TableCell className="font-medium w-[300px] max-w-[300px]">
        <div className="flex items-center space-x-2 max-w-full">
          <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {occa.image ? (
              <img 
              src={occa.image} 
              alt={occa.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  const fallbackElement = document.createElement('div');
                  e.currentTarget.parentElement.appendChild(fallbackElement);
                    fallbackElement.innerHTML = '<svg class="w-full h-full p-2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M3 10h18"/><path d="m17 22 5-5"/><path d="m17 17 5 5"/></svg>';
                }
              }}
              />
            ) : (
              <Calendar className="w-full h-full p-2 text-muted-foreground" />
            )}
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <TruncatedText text={occa.title} className="font-medium" />
          </div>
        </div>
      </TableCell>
      <TableCell className="w-[120px] whitespace-nowrap">
        {format(new Date(occa.date), "dd/MM/yyyy")}
      </TableCell>
      <TableCell className="w-[200px] max-w-[200px]">
        <div className="overflow-hidden">
          <TruncatedText text={occa.location} />
        </div>
      </TableCell>
      <TableCell className="text-center w-[120px]">
        {occa.status === 'draft' ? (
          <span className="text-center block text-muted-foreground">-</span>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-sm">
              <span className="font-medium">{occa.ticketsSold}</span>
              <span className="text-muted-foreground">/{occa.ticketsTotal}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
              <div 
                className="bg-primary h-1.5 rounded-full" 
                style={{ width: `${(occa.ticketsSold / occa.ticketsTotal) * 100}%` }} 
              ></div>
            </div>
          </div>
        )}
      </TableCell>
      <TableCell className="text-center w-[120px]">
        <div className="flex justify-center">
          <Badge
            variant={
              occa.status === "active"
                ? "default"
                : occa.status === "completed"
                ? "outline"
                : "secondary"
            }
            className="whitespace-nowrap"
          >
            {occa.status === "active" ? (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Đang bán vé
              </div>
            ) : occa.status === "completed" ? (
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 mr-1" />
                Đã kết thúc
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 mr-1" />
                Bản nháp
              </div>
            )}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="text-right w-[60px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Tác vụ</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(occa.id)}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Xem chi tiết</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(occa.id)}>
              <FileEdit className="mr-2 h-4 w-4" />
              <span>Chỉnh sửa</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(occa.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Xóa</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
