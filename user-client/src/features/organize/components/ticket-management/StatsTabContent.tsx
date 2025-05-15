import { Users, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/commons/components/card";
import { formatCurrency } from "@/utils/formatters";
import { TicketInfo } from "../../internal-types/ticket.type";
import {
  TicketManagementSharedProps,
  getTotalSoldTickets,
  getSoldPercentage,
  getTotalRevenue,
} from "./utils";

interface StatsTabContentProps
  extends Omit<TicketManagementSharedProps, "occaInfo"> {
  tickets: TicketInfo[];
  occaInfo?: TicketManagementSharedProps["occaInfo"]; // Make occaInfo optional since it's not used
}

export const StatsTabContent = ({
  showInfo,
  totalSoldTickets,
  revenueByClass,
  tickets,
}: StatsTabContentProps) => {
  // Calculate check-in statistics
  const checkedInStatistics = {
    checkedIn: tickets.filter((ticket) => ticket.checkedInAt).length,
    notCheckedIn: tickets.filter((ticket) => !ticket.checkedInAt).length,
    total: tickets.length,
    checkedInPercentage:
      tickets.length > 0
        ? Math.round(
            (tickets.filter((ticket) => ticket.checkedInAt).length /
              tickets.length) *
              100
          )
        : 0,
  };

  const totalSold = getTotalSoldTickets(showInfo, totalSoldTickets);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Trạng thái check-in
          </CardTitle>
          <CardDescription>Số lượng người đã check-in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around h-[200px]">
            <div className="flex flex-col items-center">
              <div className="text-6xl font-bold mb-1">
                {checkedInStatistics.checkedInPercentage}%
              </div>
              <p className="text-muted-foreground text-l">Tỷ lệ check-in</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-6xl font-bold mb-1">
                {checkedInStatistics.checkedIn}
              </div>
              <p className="text-muted-foreground text-l">Đã check-in</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Doanh thu theo loại vé
          </CardTitle>
          <CardDescription>
            Phân tích doanh thu và số lượng vé theo từng loại
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueByClass.length > 0
              ? revenueByClass.map((ticketClass) => (
                  <div key={ticketClass.ticketClassId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">
                          {ticketClass.ticketClassName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ticketClass.ticketsSold} vé đã bán
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(ticketClass.totalRevenue)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {totalSold > 0
                            ? Math.round(
                                (ticketClass.ticketsSold / totalSold) * 100
                              )
                            : 0}
                          % tổng số vé
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${
                            totalSold > 0
                              ? Math.round(
                                  (ticketClass.ticketsSold / totalSold) * 100
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              : // Hiển thị dựa trên showInfo nếu không có dữ liệu revenueByClass
                showInfo?.tickets.map((ticket) => (
                  <div key={ticket.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">{ticket.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(ticket.price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {ticket.sold || 0}/{ticket.available}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ticket.available > 0
                            ? Math.round(
                                ((ticket.sold || 0) / ticket.available) * 100
                              )
                            : 0}
                          %
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${
                            ticket.available > 0
                              ? Math.round(
                                  ((ticket.sold || 0) / ticket.available) * 100
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}

            <div className="pt-6 mt-6 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Tổng doanh thu:</span>
                <span className="font-bold text-xl">
                  {formatCurrency(getTotalRevenue(showInfo, revenueByClass))}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold">Tổng số vé đã bán:</span>
                <span className="font-bold">{totalSold} vé</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold">Tỷ lệ bán vé:</span>
                <span className="font-bold">
                  {getSoldPercentage(showInfo, totalSoldTickets)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
