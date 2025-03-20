import { useState } from "react";
import { format, parse } from "date-fns";
import { vi } from "date-fns/locale";
import { Trash2, Edit, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/commons/components/card";
import { Button } from "@/commons/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/commons/components/dropdown-menu";
import { Badge } from "@/commons/components/badge";
import { ShowFormData } from "../../internal-types/organize.type";

interface ShowCardProps {
  show: ShowFormData;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onStatusChange: (index: number, status: string) => void;
}

const statusOptions = [
  { value: 'upcoming', label: 'Sắp mở bán', color: 'primary' },
  { value: 'on_sale', label: 'Đang bán', color: 'success' },
  { value: 'sold_out', label: 'Đã bán hết', color: 'destructive' },
  { value: 'ended', label: 'Đã kết thúc', color: 'secondary' }
];

const getStatusBadgeVariant = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status);
  return option || statusOptions[0];
};

export const ShowCard = ({ 
  show, 
  index, 
  onEdit, 
  onDelete, 
  onStatusChange 
}: ShowCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const statusOption = getStatusBadgeVariant(show.saleStatus || 'upcoming');
  
  return (
    <Card key={show.id || index}>
      <CardContent className="p-6 relative">
        {/* Status badge in top right corner */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Badge variant={statusOption.color as 'primary' | 'success' | 'destructive' | 'secondary'}>
            {statusOption.label}
          </Badge>
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Trạng thái bán</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup 
                value={show.saleStatus || 'upcoming'} 
                onValueChange={(value) => {
                  onStatusChange(index, value);
                  setIsOpen(false);
                }}
              >
                {statusOptions.map(option => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex flex-col space-y-1.5 pt-4">
          <h4 className="text-sm font-semibold">
            {format(parse(show.date, 'yyyy-MM-dd', new Date()), 'EEEE', { locale: vi })}
          </h4>
          <p className="text-2xl font-semibold">
            {format(parse(show.date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}
          </p>
          <p className="text-muted-foreground">{show.time}</p>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => onDelete(index)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => onEdit(index)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Sửa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
