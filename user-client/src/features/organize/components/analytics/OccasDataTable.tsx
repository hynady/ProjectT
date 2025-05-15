import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/commons/components/table";

import { Button } from "@/commons/components/button";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,

  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";

import { Skeleton } from "@/commons/components/skeleton";
import { OccaAnalyticsData } from "../../services/analytics-trend.service";
import { formatCurrency } from "@/utils/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/commons/components/tooltip";

interface OccasDataTableProps {
  title?: string;
  description?: string;
  data: OccaAnalyticsData[] | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onSortChange: (field: keyof OccaAnalyticsData, order: "asc" | "desc") => void;
  onSearch?: (term: string) => void;
  sortField: keyof OccaAnalyticsData;
  sortOrder: "asc" | "desc";
}

const OccasDataTable: React.FC<OccasDataTableProps> = ({
data,
  total,
  page,
  pageSize,
  totalPages,
  loading,
  onPageChange,
  onSortChange,
  sortField,
  sortOrder,
}) => {


  const renderSortIcon = (field: keyof OccaAnalyticsData) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  const handleSort = (field: keyof OccaAnalyticsData) => {
    const newOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    onSortChange(field, newOrder);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div>
      <Table>
        {" "}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">ID</TableHead>
            <TableHead className="w-[350px]">Sự kiện</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("reach")}
            >
              <div className="flex items-center">
                Lượt tiếp cận {renderSortIcon("reach")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("revenue")}
            >
              <div className="flex items-center">
                Doanh thu {renderSortIcon("revenue")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("fillRate")}
            >
              <div className="flex items-center">
                <div className="flex items-center">
                  Tỉ lệ lấp đầy
                  <Tooltip>
                    <TooltipTrigger className="ml-1">
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Tính từ lúc tạo occa đến ngày kết thúc đã chọn
                    </TooltipContent>
                  </Tooltip>
                </div>
                {renderSortIcon("fillRate")}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>{" "}
        <TableBody>
          {data && data.length > 0 ? (
            data.map((occa) => (
              <TableRow key={occa.id}>
                <TableCell>{occa.id}</TableCell>
                <TableCell className="font-medium">{occa.title}</TableCell>
                <TableCell>{occa.reach.toLocaleString()}</TableCell>
                <TableCell>{formatCurrency(occa.revenue)}</TableCell>
                <TableCell>{occa.fillRate}%</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Không có dữ liệu sự kiện
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {(page - 1) * pageSize + 1} -{" "}
            {Math.min(page * pageSize, total)} trên {total} sự kiện
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = page;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OccasDataTable;
