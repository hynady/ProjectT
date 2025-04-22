import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/commons/components/button';
import { Card } from '@/commons/components/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/commons/components/popover';
import { Calendar } from '@/commons/components/calendar';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

// Import components
import TrendChart from '../components/analytics/TrendChart';
import TrafficSourcesChart from '../components/analytics/TrafficSourcesChart';
import TopEvents from '../components/analytics/TopEventCards';
import { Skeleton } from '@/commons/components/skeleton';
import VisitorCard from '../components/analytics/VisitorCard';

// Custom Hooks
import { useAnalyticsOverview } from '../hooks/useAnalyticsOverview';
import { useAnalyticsTrends } from '../hooks/useAnalyticsTrends';
import { DashboardLayout } from "../layouts/DashboardLayout";

const COLORS = ['#8884d8', '#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

const OrganizeAnalyticsPageNew = () => {
  // Date range state with default to last 7 days  
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  // Temporary date range for selection
  const [tempDateRange, setTempDateRange] = React.useState<DateRange>(dateRange);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  // Use dateRange for analytics
  const analyticsPeriod = React.useMemo(() => {
    if (dateRange.from && dateRange.to) {
      return [dateRange.from, dateRange.to] as [Date, Date];
    }
    return null;
  }, [dateRange.from, dateRange.to]);

  // Get data based on date range
  const { 
    data: analyticsData, 
    loading: overviewLoading 
  } = useAnalyticsOverview(analyticsPeriod);
  const { 
    data: trendData
  } = useAnalyticsTrends(analyticsPeriod);

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
          </div>
          <div className="flex items-center gap-3">
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
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-12">
          {overviewLoading ? (
            <>
              <Skeleton className="h-[120px] md:col-span-4" />
              <Skeleton className="h-[120px] md:col-span-4" />
              <Skeleton className="h-[120px] md:col-span-4" />
            </>
          ) : (
            <>
              <Card className="md:col-span-4">
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
              </Card>
              <Card className="md:col-span-4">
                <VisitorCard
                  title="Sự kiện được xem nhiều nhất"
                  value={analyticsData?.topOccas?.[0]?.reach || 0}
                  subtitle={analyticsData?.topOccas?.[0]?.title}
                  trend={-5.2}
                />
              </Card>
            </>
          )}

          <div className="md:col-span-8">
            <TrendChart
              title="Xu hướng truy cập theo thời gian"
              description="Biểu đồ thể hiện số lượt truy cập theo thời gian"
              data={trendData || []}
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

          <div className="md:col-span-12">
            <TopEvents
              title="Sự kiện nổi bật"
              description="Top sự kiện có lượt truy cập cao nhất"
              events={analyticsData?.topOccas || []}
              onViewDetails={() => {}}
              colors={COLORS}
              totalReach={analyticsData?.totalReach || 0}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrganizeAnalyticsPageNew;
