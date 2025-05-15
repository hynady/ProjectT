import {
  AlertCircle,
  ArrowUpDown,
  Filter,
  Calendar,
  RefreshCw
} from "lucide-react";

// Components
import { ScrollArea, ScrollBar } from "@/commons/components/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from "@/commons/components/dropdown-menu";
import { Button } from "@/commons/components/button";
import { Badge } from "@/commons/components/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/commons/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/commons/components/table";
import { Skeleton } from "@/commons/components/skeleton";

import { DataTablePagination } from "./DataTablePagination";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  id: string;
  header: string | React.ReactNode;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  truncate?: boolean; // New property to control truncation
}

export interface StatusOption {
  value: string;
  label: string;
  badge?: 'default' | 'outline' | 'secondary' | 'info' | 'destructive' | 'success' | 'warning';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  error?: string | null;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  statusOptions?: StatusOption[];
  statusFilter?: string;
  searchQuery?: string;
  emptyComponent?: React.ReactNode;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  onStatusChange?: (status: string) => void;
  rowActions?: (item: T) => React.ReactNode;
  isLast?: boolean;
  isFirst?: boolean;
  refreshData?: () => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading = false,
  error = null,
  page = 0,
  pageSize = 10,
  totalItems = 0,
  totalPages = 0,
  sortField,
  sortDirection = 'asc',
  statusOptions,
  statusFilter = 'all',
  searchQuery,
  emptyComponent,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onStatusChange,
  rowActions,
  isLast = false,
  isFirst = true,
  refreshData
}: DataTableProps<T>) {

  const handleSort = (column: string) => {
    if (onSortChange) {
      const newDirection = sortField === column && sortDirection === 'asc' ? 'desc' : 'asc';
      onSortChange(column, newDirection);
    }
  };

  // Create pagination object in the format expected by Pagination component
  const pagination = {
    number: page,
    size: pageSize,
    totalElements: totalItems,
    totalPages,
    last: isLast,
    first: isFirst,
    pageable: {
      pageNumber: page,
      pageSize
    }
  };

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            Lỗi
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const isEmpty = !isLoading && (!data || data.length === 0);

  return (
    <div className="flex flex-col h-full">
      {statusOptions && (
        <div className="px-4 py-3 border-b">          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 h-8">
                    <Filter className="h-4 w-4" />
                    <span>
                      {statusOptions.find(option => option.value === statusFilter)?.label || 'Tất cả'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {statusOptions.map(option => (
                    <DropdownMenuCheckboxItem 
                      key={option.value}
                      checked={statusFilter === option.value}
                      onCheckedChange={() => onStatusChange && onStatusChange(option.value)}
                    >
                      {option.badge ? (
                        <div className="flex items-center gap-2">
                          <Badge variant={option.badge} className="w-2 h-2 rounded-full p-0" />
                          <span>{option.label}</span>
                        </div>
                      ) : option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => refreshData && refreshData()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="sr-only">Làm mới</span>
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <>Hiển thị <span className="font-medium text-foreground">{totalItems}</span> mục</>
              )}
            </div>
          </div>
        </div>
      )}
      
      {isEmpty ? (
        emptyComponent || <EmptyState searchQuery={searchQuery} statusFilter={statusFilter} />
      ) : (
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead 
                        key={column.id} 
                        className={column.width ? column.width : ''}
                        style={{textAlign: column.align || 'left'}}
                      >
                        {column.sortable && onSortChange ? (
                          <div className={`flex items-center ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-between'}`}>
                            <Button 
                              variant="ghost" 
                              onClick={() => handleSort(column.id)}
                              className="px-0 hover:bg-transparent flex items-center gap-1"
                            >
                              <span>{typeof column.header === 'string' ? column.header : ''}</span>
                              <ArrowUpDown className={`h-4 w-4 ${sortField === column.id ? "opacity-100" : "opacity-30"} transition-all`} />
                            </Button>
                          </div>
                        ) : (
                          column.header
                        )}
                      </TableHead>
                    ))}
                    {rowActions && (
                      <TableHead className="w-[60px] text-right">
                        <span className="sr-only">Tác vụ</span>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(pageSize).fill(0).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell colSpan={columns.length + (rowActions ? 1 : 0)}>
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-10 rounded-md" />
                            <Skeleton className="h-4 w-[250px]" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + (rowActions ? 1 : 0)} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <Calendar className="h-6 w-6 text-muted-foreground" />
                          <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item.id}>
                        {columns.map((column) => (
                          <TableCell 
                            key={`${item.id}-${column.id}`}
                            style={{textAlign: column.align || 'left'}}
                            className={column.truncate !== false ? "max-w-0" : ""}
                          >
                            {column.truncate !== false ? (
                              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                                {column.cell(item)}
                              </div>
                            ) : (
                              column.cell(item)
                            )}
                          </TableCell>
                        ))}
                        {rowActions && (
                          <TableCell className="text-right">
                            {rowActions(item)}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          
          {/* Pagination */}
          <DataTablePagination 
            page={page}
            setPage={onPageChange}
            paginationData={pagination}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
}
