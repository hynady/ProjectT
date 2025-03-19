import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/commons/components/button";
import { Badge } from "@/commons/components/badge";
import { ShowSaleStatus } from "../../internal-types/organize.type";
import { DateRange } from "react-day-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel
} from "@/commons/components/dropdown-menu";
import { DatePickerWithRange } from "@/commons/components/date-picker-with-range";
import { vi } from "date-fns/locale";

interface FilterControlsProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  selectedStatuses: ShowSaleStatus[];
  onStatusToggle: (status: ShowSaleStatus) => void;
  onClearStatusFilters: () => void;
  sortOption: {
    field: 'date' | 'time';
    order: 'asc' | 'desc';
  };
  onSortChange: (field: 'date' | 'time', order: 'asc' | 'desc') => void;
  onClearDateRange: () => void;
}

export const FilterControls = ({
  dateRange,
  onDateRangeChange,
  selectedStatuses,
  onStatusToggle,
  onClearStatusFilters,
  sortOption,
  onSortChange,
}: FilterControlsProps) => {
  const renderStatusFilters = () => {
    const statusOptions: {label: string; value: ShowSaleStatus; color: string}[] = [
      { label: "Sắp mở bán", value: "upcoming", color: "text-muted-foreground" },
      { label: "Mở bán", value: "on_sale", color: "text-green-500" },
      { label: "Hết vé", value: "sold_out", color: "text-red-500" },
      { label: "Đã kết thúc", value: "ended", color: "text-muted-foreground" }
    ];

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Lọc</span>
            {selectedStatuses.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {selectedStatuses.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statusOptions.map(option => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedStatuses.includes(option.value)}
              onCheckedChange={() => onStatusToggle(option.value)}
              className="capitalize"
            >
              <span className={option.color}>{option.label}</span>
            </DropdownMenuCheckboxItem>
          ))}
          {selectedStatuses.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onClearStatusFilters}
                className="text-center focus:bg-muted/50 text-muted-foreground"
              >
                Xóa lọc
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderSortOptions = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowUpDown className="h-4 w-4" />
            <span>Sắp xếp</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Sắp xếp theo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={sortOption.field === 'date' && sortOption.order === 'asc'}
            onCheckedChange={() => onSortChange('date', 'asc')}
          >
            Ngày (tăng dần)
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortOption.field === 'date' && sortOption.order === 'desc'}
            onCheckedChange={() => onSortChange('date', 'desc')}
          >
            Ngày (giảm dần)
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={sortOption.field === 'time' && sortOption.order === 'asc'}
            onCheckedChange={() => onSortChange('time', 'asc')}
          >
            Giờ (tăng dần)
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortOption.field === 'time' && sortOption.order === 'desc'}
            onCheckedChange={() => onSortChange('time', 'desc')}
          >
            Giờ (giảm dần)
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="px-6 pt-3 pb-1 flex flex-wrap gap-2">
      {/* Date Range Picker using shadcn component */}
      <div className="flex-1 min-w-[200px]">
        <DatePickerWithRange
          className="h-9"
          date={dateRange}
          onDateChange={onDateRangeChange}
          locale={vi}
          align="start"
          placeholder="Chọn khoảng ngày"
          calendarDays={2}
        />
      </div>
      <div className="flex items-center gap-2">
        {renderStatusFilters()}
        {renderSortOptions()}
      </div>
    </div>
  );
};
