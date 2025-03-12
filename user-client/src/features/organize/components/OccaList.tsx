import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpDown,
  Filter,
  Calendar
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

// Services & Types
import { organizeService } from "@/features/organize/services/organize.service";
import { OrganizerOccaUnit, Page, OccaFilterParams } from "../internal-types/organize.type";

// Custom Components
import { TableSkeleton } from "./OccaTable/TableSkeleton";
import { EmptyState } from "./OccaTable/EmptyState";
import { OccaTableRow } from "./OccaTable/OccaTableRow";
import { DeleteConfirmDialog } from "./OccaTable/DeleteConfirmDialog";
import { OccaTablePagination } from "./OccaTable/OccaTablePagination";

interface EventsTableProps {
  searchQuery?: string;
}

export type StatusFilter = 'all' | 'active' | 'completed' | 'draft';

export const EventsTable = ({ searchQuery = "" }: EventsTableProps) => {
  const navigate = useNavigate();
  const [occasPage, setOccasPage] = useState<Page<OrganizerOccaUnit>>({
    content: [],
    pageable: {
      pageNumber: 0,
      pageSize: 10,
      sort: { sorted: false, unsorted: true, empty: true },
      offset: 0,
      paged: true,
      unpaged: false,
    },
    last: true,
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    sort: { sorted: false, unsorted: true, empty: true },
    first: true,
    numberOfElements: 0,
    empty: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10); // Now using state for page size
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  
  useEffect(() => {
    const fetchOccas = async () => {
      try {
        setLoading(true);
        console.log("Fetching data for page:", page, "with size:", pageSize);
        
        // Define the filter parameters for the API call
        const params: OccaFilterParams = {
          page,
          size: pageSize,
          sort: sortField,
          direction: sortDirection,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery || undefined,
        };
        
        // Call the getOccas method from the service
        const response = await organizeService.getOccas(params);
        setOccasPage(response);
        setError(null);
      } catch (err) {
        setError("Không thể tải danh sách sự kiện");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOccas();
  }, [page, pageSize, sortField, sortDirection, statusFilter, searchQuery]);
  
  // Reset về trang đầu tiên khi thay đổi bộ lọc
  useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter, pageSize]);

  const handleEdit = (id: string) => {
    navigate(`/organize/edit/${id}`);
  };

  const handleView = (id: string) => {
    navigate(`/occas/${id}`);
  };

  const confirmDelete = (id: string) => {
    setEventToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      // In a real app, call the delete API
      // await organizeService.deleteOcca(eventToDelete);
      
      // Refetch data after deletion
      const params: OccaFilterParams = {
        page,
        size: pageSize,
        sort: sortField,
        direction: sortDirection,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      };
      
      const response = await organizeService.getOccas(params);
      setOccasPage(response);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const handleSort = (column: string) => {
    if (sortField === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(column);
      setSortDirection("asc");
    }
    // Reset về trang đầu khi thay đổi cách sắp xếp
    setPage(0);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
  };

  if (loading && occasPage.content.length === 0) {
    return <TableSkeleton />;
  }

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

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 h-8">
                <Filter className="h-4 w-4" />
                <span>{
                  statusFilter === 'all' ? 'Tất cả' : 
                  statusFilter === 'active' ? 'Đang bán vé' : 
                  statusFilter === 'completed' ? 'Đã kết thúc' : 
                  'Bản nháp'
                }</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuCheckboxItem 
                checked={statusFilter === 'all'}
                onCheckedChange={() => setStatusFilter('all')}
              >
                Tất cả
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === 'active'}
                onCheckedChange={() => setStatusFilter('active')}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="w-2 h-2 rounded-full p-0" />
                  <span>Đang bán vé</span>
                </div>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === 'completed'}
                onCheckedChange={() => setStatusFilter('completed')}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-2 h-2 rounded-full p-0" />
                  <span>Đã kết thúc</span>
                </div>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === 'draft'}
                onCheckedChange={() => setStatusFilter('draft')}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 rounded-full p-0" />
                  <span>Bản nháp</span>
                </div>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="text-sm text-muted-foreground">
            {loading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>Hiển thị <span className="font-medium text-foreground">{occasPage.totalElements}</span> sự kiện</>
            )}
          </div>
        </div>
      </div>
      
      {occasPage.empty ? (
        <EmptyState searchQuery={searchQuery} statusFilter={statusFilter} />
      ) : (
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSort("title")}
                          className="px-0 hover:bg-transparent flex items-center gap-1"
                        >
                          <span>Tên sự kiện</span>
                          <ArrowUpDown className={`h-4 w-4 ${sortField === "title" ? "opacity-100" : "opacity-30"} transition-all`} />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead className="w-[120px] whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSort("date")}
                          className="px-0 hover:bg-transparent flex items-center gap-1"
                        >
                          <span>Ngày diễn ra</span>
                          <ArrowUpDown className={`h-4 w-4 ${sortField === "date" ? "opacity-100" : "opacity-30"} transition-all`} />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead className="w-[200px]">
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSort("location")}
                          className="px-0 hover:bg-transparent flex items-center gap-1"
                        >
                          <span>Địa điểm</span>
                          <ArrowUpDown className={`h-4 w-4 ${sortField === "location" ? "opacity-100" : "opacity-30"} transition-all`} />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-[120px]">
                      <div className="flex items-center justify-center">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSort("ticketSoldPercent")}
                          className="px-0 hover:bg-transparent flex items-center gap-1"
                        >
                          <span>Vé đã bán</span>
                          <ArrowUpDown className={`h-4 w-4 ${sortField === "ticketSoldPercent" ? "opacity-100" : "opacity-30"} transition-all`} />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead className="w-[120px] text-center">Trạng thái</TableHead>
                    <TableHead className="w-[60px] text-right">
                      <span className="sr-only">Tác vụ</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(pageSize).fill(0).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell colSpan={6}>
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-10 rounded-md" />
                            <Skeleton className="h-4 w-[250px]" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : occasPage.content.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <Calendar className="h-6 w-6 text-muted-foreground" />
                          <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    occasPage.content.map((occa) => (
                      <OccaTableRow 
                        key={occa.id}
                        occa={occa}
                        onEdit={handleEdit}
                        onView={handleView}
                        onDelete={confirmDelete}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          
          {/* Always show pagination */}
          <OccaTablePagination 
            page={page}
            setPage={(newPage) => {
              console.log("Setting page to:", typeof newPage === "function" ? "function" : newPage);
              setPage(newPage);
            }}
            paginationData={occasPage}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
};
