import { CalendarClock, MapPin, TicketIcon, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/commons/components/card";
import { formatCurrency } from "@/utils/formatters";
import { 
  TicketManagementSharedProps, 
  getShowSaleStatusBadge, 
  getTotalTickets, 
  getTotalSoldTickets,
  getSoldPercentage,
  getTotalRevenue
} from "./utils";

export const InfoCards = ({ 
  occaInfo, 
  showInfo, 
  totalSoldTickets,
  revenueByClass
}: TicketManagementSharedProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Thông tin suất diễn
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Ngày</span>
              <span className="font-medium">{new Date(showInfo?.date || "").toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Thời gian</span>
              <span className="font-medium">{showInfo?.time}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-muted-foreground text-sm">Trạng thái</span>
              {getShowSaleStatusBadge(showInfo?.saleStatus)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TicketIcon className="h-4 w-4" />
            Vé
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Loại vé</span>
              <span className="font-medium">{showInfo?.tickets.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Tổng số vé</span>
              <span className="font-medium">{getTotalTickets(showInfo)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Đã bán</span>
              <span className="font-medium">{getTotalSoldTickets(showInfo, totalSoldTickets)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Doanh thu
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Tỷ lệ bán</span>
              <span className="font-medium">{getSoldPercentage(showInfo, totalSoldTickets)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Còn lại</span>
              <span className="font-medium">
                {getTotalTickets(showInfo) - getTotalSoldTickets(showInfo, totalSoldTickets)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Tổng tiền</span>
              <span className="font-medium">{formatCurrency(getTotalRevenue(showInfo, revenueByClass))}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Địa điểm
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <p className="text-sm">{occaInfo?.basicInfo.location}</p>
          <p className="text-xs text-muted-foreground mt-1">{occaInfo?.basicInfo.address}</p>
        </CardContent>
      </Card>
    </div>
  );
};
