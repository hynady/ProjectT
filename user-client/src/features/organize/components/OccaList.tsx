import { useState, useEffect } from "react";
import { Button } from "@/commons/components/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/commons/components/table";
import { 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/commons/components/dropdown-menu-pointer-cursor";
import { Badge } from "@/commons/components/badge";
import { 
  Edit, 
  MoreHorizontal, 
  Eye, 
  Trash, 
  AlertCircle,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OrganizerOccaUnit } from "../internal-types/organize.type";
import { format } from "date-fns";
import { organizeService } from "@/features/organize/services/organize.service";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";

interface OccaListProps {
  type: "upcoming" | "past" | "draft";
  organizerId: string;
}

export const OccaList = ({ type, organizerId }: OccaListProps) => {
  const navigate = useNavigate();
  const [occas, setOccas] = useState<OrganizerOccaUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOccas = async () => {
      try {
        setLoading(true);
        const data = await organizeService.getOccasByType(type, organizerId);
        setOccas(data);
        setError(null);
      } catch (err) {
        setError("Không thể tải danh sách sự kiện");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (organizerId) {
      fetchOccas();
    }
  }, [type, organizerId]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500">Đang bán</Badge>;
      case "draft":
        return <Badge variant="outline">Bản nháp</Badge>;
      case "completed":
        return <Badge variant="secondary">Đã kết thúc</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (occas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/10">
        <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Chưa có sự kiện nào</p>
        <p className="text-muted-foreground mb-6">
          {type === "upcoming"
            ? "Bạn chưa có sự kiện sắp tới nào"
            : type === "past"
            ? "Bạn chưa có sự kiện đã kết thúc nào"
            : "Bạn chưa có bản nháp sự kiện nào"}
        </p>
        <Button onClick={() => navigate("/organize/create")}>
          Tạo sự kiện mới
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên sự kiện</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Địa điểm</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Vé đã bán</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {occas.map((occa) => (
            <TableRow key={occa.id}>
              <TableCell className="font-medium max-w-[200px] truncate">
                {occa.title}
              </TableCell>
              <TableCell>
                {occa.date && format(new Date(occa.date), "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="max-w-[150px] truncate">
                {occa.location}
              </TableCell>
              <TableCell>{getStatusBadge(occa.status)}</TableCell>
              <TableCell>
                {occa.ticketsSold}/{occa.ticketsTotal}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Mở menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/occas/${occa.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Xem</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/organize/edit/${occa.id}`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Sửa</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Xóa</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
