import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/commons/components/input";
import { Button } from "@/commons/components/button";
import { Badge } from "@/commons/components/badge";
import { ShowSaleStatus } from "../../internal-types/organize.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel
} from "@/commons/components/dropdown-menu";

interface FilterControlsProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedStatuses: ShowSaleStatus[];
  onStatusToggle: (status: ShowSaleStatus) => void;
  onClearStatusFilters: () => void;
  sortOption: {
    field: 'date' | 'time';
    order: 'asc' | 'desc';
  };
  onSortChange: (field: 'date' | 'time', order: 'asc' | 'desc') => void;
}

export const FilterControls = ({
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onStatusToggle,
  onClearStatusFilters,
  sortOption,
  onSortChange
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
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm suất diễn..."
          className="pl-8 w-full h-9"
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>
      <div className="flex items-center gap-2">
        {renderStatusFilters()}
        {renderSortOptions()}
      </div>
    </div>
  );
};
