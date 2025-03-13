import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ChevronDown
} from "lucide-react";
import { Button } from "@/commons/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/commons/components/dropdown-menu";

interface PaginationData {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  pageable: {
    pageNumber: number;
    pageSize: number;
  }
}

interface DataTablePaginationProps {
  page: number;
  setPage: (page: number) => void;
  paginationData: PaginationData;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export const DataTablePagination = ({ 
  page, 
  setPage, 
  paginationData, 
  pageSize, 
  onPageSizeChange 
}: DataTablePaginationProps) => {
  // Generate page numbers to display with fewer adjacent pages
  const getPageNumbers = () => {
    const totalPages = paginationData.totalPages || 1;
    const currentPage = paginationData.number;
    
    // For small page counts, show all pages
    if (totalPages <= 5) {
      return Array.from({ length: Math.max(1, totalPages) }, (_, i) => i);
    }
    
    // Complex logic for larger page counts but with fewer adjacent pages
    const pageNumbers = [];
    
    // Always include first page
    pageNumbers.push(0);
    
    // For pages close to the beginning
    if (currentPage <= 2) {
      pageNumbers.push(1);
      pageNumbers.push(2);
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages - 1);
    } 
    // For pages close to the end
    else if (currentPage >= totalPages - 3) {
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages - 3);
      pageNumbers.push(totalPages - 2);
      pageNumbers.push(totalPages - 1);
    } 
    // For pages in the middle - show only current page with one before and after
    else {
      pageNumbers.push('ellipsis');
      // Just show previous, current, and next page
      pageNumbers.push(currentPage - 1);
      pageNumbers.push(currentPage);
      pageNumbers.push(currentPage + 1);
      pageNumbers.push('ellipsis2');
      pageNumbers.push(totalPages - 1);
    }
    
    return pageNumbers;
  };

  const pageSizeOptions = [5, 10, 20, 30];
  const pageNumbers = getPageNumbers();

  // Helper to get current range of items being displayed
  const startItem = paginationData.pageable.pageSize * paginationData.number + 1;
  const endItem = paginationData.last 
    ? paginationData.totalElements 
    : paginationData.pageable.pageSize * (paginationData.number + 1);

  return (
    <>
      {/* Desktop version - hidden on mobile (< md breakpoint) */}
      <div className="hidden md:flex items-center justify-between px-2 py-4 border-t">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
                {pageSize} mục
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {pageSizeOptions.map(size => (
                <DropdownMenuItem 
                  key={size}
                  onClick={() => onPageSizeChange(size)}
                  className="cursor-pointer"
                >
                  {size} mục mỗi trang
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="text-sm text-muted-foreground">
            Hiển thị {startItem} đến {endItem} trong số {paginationData.totalElements} mục
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={paginationData.first}
            onClick={() => setPage(0)}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Trang đầu</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={paginationData.first}
            onClick={() => setPage(Math.max(0, page - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Trang trước</span>
          </Button>
          
          <div className="flex items-center space-x-1">
            {pageNumbers.map((pageNum, index) => {
              if (pageNum === 'ellipsis' || pageNum === 'ellipsis2') {
                return (
                  <div 
                    key={`ellipsis-${index}`}
                    className="flex items-center justify-center h-8 w-8 text-sm"
                  >
                    &hellip;
                  </div>
                );
              }
              
              return (
                <Button
                  key={`page-${pageNum}`}
                  variant={paginationData.number === pageNum ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(pageNum as number)}
                >
                  <span>{(pageNum as number) + 1}</span>
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={paginationData.last}
            onClick={() => setPage(Math.min(paginationData.totalPages - 1, page + 1))}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Trang sau</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={paginationData.last}
            onClick={() => setPage(paginationData.totalPages - 1)}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Trang cuối</span>
          </Button>
        </div>
      </div>

      {/* Mobile version - only shown below md breakpoint */}
      <div className="flex md:hidden flex-col px-2 py-4 border-t gap-4">
        {/* Top row: items per page + info */}
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
                {pageSize} mục
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {pageSizeOptions.map(size => (
                <DropdownMenuItem 
                  key={size}
                  onClick={() => onPageSizeChange(size)}
                  className="cursor-pointer"
                >
                  {size} mục mỗi trang
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="text-sm text-muted-foreground">
            {startItem}-{endItem} / {paginationData.totalElements}
          </div>
        </div>
        
        {/* Bottom row: simplified pagination */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={paginationData.first}
            onClick={() => setPage(Math.max(0, page - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm font-medium">
            Trang {paginationData.number + 1} / {Math.max(1, paginationData.totalPages)}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={paginationData.last}
            onClick={() => setPage(Math.min(paginationData.totalPages - 1, page + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};
