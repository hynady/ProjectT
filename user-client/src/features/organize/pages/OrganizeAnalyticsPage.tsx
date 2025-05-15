import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/commons/components/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/commons/components/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/commons/components/popover';
import { Calendar } from '@/commons/components/calendar';
import { CalendarIcon, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/commons/hooks/use-toast';
import { generateAnalyticsExcel } from '@/utils/excel-export';

// Import components
import TrendChart from '../components/analytics/TrendChart';
import TrafficSourcesChart from '../components/analytics/TrafficSourcesChart';
import RevenueTrendChart from '../components/analytics/RevenueTrendChart';
import RevenueDistributionChart from '../components/analytics/RevenueDistributionChart';
import { Skeleton } from '@/commons/components/skeleton';
import VisitorCard from '../components/analytics/VisitorCard';
import TopOccaCards from '@/features/organize/components/analytics/TopOccaCards';
import OccasDataTable from '@/features/organize/components/analytics/OccasDataTable';

// Custom Hooks
import { useAnalyticsOverview } from '../hooks/useAnalyticsOverview';
import { useAnalyticsTrends } from '../hooks/useAnalyticsTrends';
import { useRevenueTrends } from '../hooks/useRevenueTrends';
import { useRevenueOverview } from '../hooks/useRevenueOverview';
import { useOccasAnalytics } from '../hooks/useOccasAnalytics';
import { DashboardLayout } from "../layouts/DashboardLayout";
import { OccaAnalyticsData } from '../services/analytics-trend.service';

const COLORS = ['#8884d8', '#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

const OrganizeAnalyticsPage = () => {
  const { toast } = useToast();
  // Date range state with default to last 7 days  
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  // Temporary date range for selection
  const [tempDateRange, setTempDateRange] = useState<DateRange>(dateRange);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // Table state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof OccaAnalyticsData>('reach');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Use dateRange for analytics
  const analyticsPeriod = React.useMemo(() => {
    if (dateRange.from && dateRange.to) {
      return [dateRange.from, dateRange.to] as [Date, Date];
    }
    return null;
  }, [dateRange.from, dateRange.to]);  // Get data based on date range
  const { 
    data: analyticsData, 
    loading: overviewLoading 
  } = useAnalyticsOverview(analyticsPeriod);
  
  const {
    data: revenueData,
    loading: revenueLoading
  } = useRevenueOverview(analyticsPeriod);
  
  const { 
    data: visitorTrendData
  } = useAnalyticsTrends(analyticsPeriod);
  
  const {
    data: revenueTrendData
  } = useRevenueTrends(analyticsPeriod);
  const {
    data: occasAnalyticsData,
    loading: occasLoading,
    allData  } = useOccasAnalytics(analyticsPeriod, {
    pageSize: pageSize,
    sortField: sortField,
    sortOrder: sortOrder
  });

  // Use the first 5 items from the server response as featured events
  // The data is already sorted by the server according to sortField and sortOrder
  const topOccasData = React.useMemo(() => {
    return allData.slice(0, 5);
  }, [allData]);

  // UI state
  const handleTempDateChange = (range: DateRange | undefined) => {
    setTempDateRange(range || { from: undefined, to: undefined });
  };

  const handleApplyDateRange = () => {
    if (tempDateRange?.from && tempDateRange?.to) {
      setDateRange(tempDateRange);
      setIsCalendarOpen(false);
    }
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (field: keyof OccaAnalyticsData, order: 'asc' | 'desc') => {
    setSortField(field);
    setSortOrder(order);
  };
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleDownloadReport = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Lỗi xuất báo cáo",
        description: "Vui lòng chọn khoảng thời gian trước khi xuất báo cáo",
        variant: "destructive", 
      });
      return;
    }

    setIsExporting(true);
    try {
      // Generate file name with date range
      const fromDate = format(dateRange.from, 'dd-MM-yyyy'); 
      const toDate = format(dateRange.to, 'dd-MM-yyyy');
      const fileName = `Bao-cao-phan-tich-tu-${fromDate}-den-${toDate}.xlsx`;

      // Wait for all data to be loaded first
      if (occasLoading) {
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (!occasLoading) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      }

      // Call the export function with all data
      const success = generateAnalyticsExcel(fileName, {
        overview: analyticsData,
        revenue: revenueData,
        visitorTrend: visitorTrendData,
        revenueTrend: revenueTrendData,
        occas: allData, 
        dateRange: {
          from: dateRange.from,
          to: dateRange.to
        }
      });

      if (success) {
        toast({
          title: "Xuất báo cáo thành công",
          description: "Báo cáo đã được tải xuống",
          variant: "success",
        });
      } else {
        throw new Error("Failed to export");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Lỗi xuất báo cáo", 
        description: "Không thể tạo file Excel. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6 space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Phân tích dữ liệu</h1>
            <p className="text-sm text-muted-foreground">
              {analyticsData ? (
                <>
                  Dữ liệu từ {format(analyticsData.period.from, 'dd/MM/yyyy')} 
                  đến {format(analyticsData.period.to, 'dd/MM/yyyy')}
                </>
              ) : (
                'Xem chi tiết về lượt tiếp cận và nguồn truy cập của các sự kiện'
              )}
            </p>
          </div>          <div className="flex items-center gap-3">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateRange?.from && dateRange?.to ? (
                    <>
                      {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                    </>
                  ) : (
                    'Chọn khoảng thời gian'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="space-y-3 p-3">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={tempDateRange?.from}
                    selected={tempDateRange}
                    onSelect={handleTempDateChange}
                    numberOfMonths={2}
                  />
                  <div className="flex justify-end border-t pt-3">
                    <Button 
                      onClick={handleApplyDateRange}
                      disabled={!tempDateRange?.from || !tempDateRange?.to}
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline" 
              className="h-9"
              onClick={handleDownloadReport}
              disabled={isExporting || overviewLoading || revenueLoading || !dateRange.from || !dateRange.to}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Đang xuất...' : 'Tải xuống báo cáo Excel'}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-12">          {overviewLoading || revenueLoading ? (
            <>
              <Skeleton className="h-[120px] md:col-span-4" />
              <Skeleton className="h-[120px] md:col-span-4" />
              <Skeleton className="h-[120px] md:col-span-4" />
              <Skeleton className="h-[120px] md:col-span-4" />
              <Skeleton className="h-[120px] md:col-span-4" />
              <Skeleton className="h-[120px] md:col-span-4" />
            </>
          ) : (
            <>              <Card className="md:col-span-4">
                <VisitorCard
                  title="Lượt tiếp cận"
                  value={analyticsData?.totalReach || 0}
                  trend={12.3}
                />
              </Card>
              <Card className="md:col-span-4">
                <VisitorCard
                  title="Top nguồn truy cập"
                  value={analyticsData?.sourceDistribution?.[0]?.count || 0}
                  subtitle={analyticsData?.sourceDistribution?.[0]?.name}
                  trend={8.1}
                />
              </Card>              <Card className="md:col-span-4">
                <VisitorCard
                  title="Sự kiện được xem nhiều nhất"
                  value={topOccasData?.[0]?.reach || 0}
                  subtitle={topOccasData?.[0]?.title}
                  trend={-5.2}
                />
              </Card>
              <Card className="md:col-span-4">
                <VisitorCard
                  title="Tổng doanh thu"
                  value={revenueData?.totalRevenue || 0}
                  subtitle="VNĐ"
                  trend={15.7}
                />
              </Card>
              <Card className="md:col-span-4">
                <VisitorCard
                  title="Sự kiện có doanh số cao nhất"
                  value={topOccasData?.[0]?.revenue || 0}
                  subtitle={topOccasData?.[0]?.title}
                  trend={10.3}
                />
              </Card>
              <Card className="md:col-span-4">
                <VisitorCard
                  title="Show có doanh số cao nhất"
                  value={revenueData?.revenueDistribution?.[0]?.amount || 0}
                  subtitle={revenueData?.revenueDistribution?.[0]?.name}
                  trend={7.5}
                />
              </Card>
            </>
          )}

          <div className="md:col-span-8">
            <TrendChart
              title="Xu hướng truy cập theo thời gian"
              description="Biểu đồ thể hiện số lượt truy cập theo thời gian"
              data={visitorTrendData || []}
              dateRange={{
                from: dateRange.from || new Date(),
                to: dateRange.to || new Date()
              }}
            />
          </div>

          <div className="md:col-span-4">
            <TrafficSourcesChart
              title="Phân bố nguồn truy cập"
              description="Tỉ lệ lượt truy cập từ các nguồn khác nhau"
              data={analyticsData?.sourceDistribution || []}
              colors={COLORS}
            />
          </div>
          
          <div className="md:col-span-8">
            <RevenueTrendChart
              title="Xu hướng doanh thu theo thời gian"
              description="Biểu đồ thể hiện doanh thu theo thời gian"
              data={revenueTrendData || []}
              dateRange={{
                from: dateRange.from || new Date(),
                to: dateRange.to || new Date()
              }}
            />
          </div>          <div className="md:col-span-4">
            <RevenueDistributionChart
              title="Phân bố doanh thu theo loại"
              description="Tỉ lệ doanh thu từ các loại sự kiện"
              data={revenueData?.revenueDistribution || []}
              colors={COLORS}
            />
          </div>

          <div className="md:col-span-12">
            <Card>
              <CardHeader>
                <CardTitle>Phân tích sự kiện</CardTitle>
                <CardDescription>Chi tiết về các sự kiện và số liệu phân tích</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Top Events Section */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium">Sự kiện nổi bật</h3>
                    <p className="text-sm text-muted-foreground">Top sự kiện có lượt truy cập cao nhất</p>
                  </div>
                  <TopOccaCards
                    title=""
                    description=""
                    occas={topOccasData || []}
                    colors={COLORS}
                    totalReach={analyticsData?.totalReach || 0}
                  />
                </div>

                {/* Table Section */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium">Tất cả sự kiện</h3>
                    <p className="text-sm text-muted-foreground">Dữ liệu chi tiết về tất cả các sự kiện</p>
                  </div>
                  <OccasDataTable
                    title=""
                    description=""
                    data={occasAnalyticsData?.data || []}
                    total={occasAnalyticsData?.total || 0}
                    page={currentPage}
                    pageSize={pageSize}
                    totalPages={occasAnalyticsData?.totalPages || 1}
                    loading={occasLoading}
                    onPageChange={handlePageChange}
                    onSortChange={handleSortChange}
                    onSearch={handleSearch}
                    sortField={sortField}
                    sortOrder={sortOrder}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>    </DashboardLayout>
  );
};

export default OrganizeAnalyticsPage;
