import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/commons/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/commons/components/tabs';
import { analyticsService } from '@/features/organize/services/analytics.service';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { Button } from '@/commons/components/button';

interface OccaAnalyticsProps {
  occaId: string;
}

interface AnalyticsData {
  userReach: number;
  sources: {
    name: string;
    value: number;
  }[];
  loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const OccaAnalytics: React.FC<OccaAnalyticsProps> = ({ occaId }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userReach: 0,
    sources: [],
    loading: true
  });
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsService.getOccaAnalytics(occaId);
        
        // Transform sources data for charts
        const sourcesData = Object.entries(data.sources || {}).map(([name, value]) => ({
          name,
          value: value as number
        }));

        setAnalyticsData({
          userReach: data.totalReach || 0,
          sources: sourcesData,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        setAnalyticsData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAnalytics();
  }, [occaId]);

  if (analyticsData.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải dữ liệu phân tích...</span>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Phân tích sự kiện</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8">
            <span className="mr-2">Tuần này</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50"><path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4"><path d="M2.5 3C2.22386 3 2 3.22386 2 3.5C2 3.77614 2.22386 4 2.5 4H12.5C12.7761 4 13 3.77614 13 3.5C13 3.22386 12.7761 3 12.5 3H2.5ZM2 7.5C2 7.22386 2.22386 7 2.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H2.5C2.22386 8 2 7.77614 2 7.5ZM2 11.5C2 11.2239 2.22386 11 2.5 11H12.5C12.7761 11 13 11.2239 13 11.5C13 11.7761 12.7761 12 12.5 12H2.5C2.22386 12 2 11.7761 2 11.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            Lọc
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Tổng người dùng tiếp cận</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{analyticsData.userReach.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="inline-flex items-center text-emerald-600 mr-1">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M7.14645 2.14645C7.34171 1.95118 7.65829 1.95118 7.85355 2.14645L11.8536 6.14645C12.0488 6.34171 12.0488 6.65829 11.8536 6.85355C11.6583 7.04882 11.3417 7.04882 11.1464 6.85355L8 3.70711L8 12.5C8 12.7761 7.77614 13 7.5 13C7.22386 13 7 12.7761 7 12.5L7 3.70711L3.85355 6.85355C3.65829 7.04882 3.34171 7.04882 3.14645 6.85355C2.95118 6.65829 2.95118 6.34171 3.14645 6.14645L7.14645 2.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                12.3%
              </span>
              <span>so với tuần trước</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Phân bố nguồn truy cập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[210px]">
              {analyticsData.sources.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.sources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      innerRadius={30}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.sources.map((_entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} lượt truy cập`, 'Số lượng']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Không có dữ liệu nguồn tiếp cận
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>      <Tabs defaultValue="source" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="source">Phân tích nguồn</TabsTrigger>
          <TabsTrigger value="trend">Xu hướng thời gian</TabsTrigger>
        </TabsList>
        
        <TabsContent value="source" className="space-y-4 pt-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Chi tiết nguồn truy cập</CardTitle>
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                7 ngày qua
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {analyticsData.sources.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.sources}
                      margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                      barSize={40}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px' }}
                        formatter={(value: number) => [`${value} lượt truy cập`, 'Số lượng']}
                      />
                      <Legend 
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Lượt truy cập" 
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                        className="hover:opacity-80 cursor-pointer"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Không có dữ liệu nguồn truy cập
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analyticsData.sources.slice(0, 3).map((source, index) => (
              <Card key={source.name} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <CardTitle className="text-sm font-medium">{source.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{source.value.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(source.value / analyticsData.userReach * 100).toFixed(1)}% từ tổng lượt truy cập
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trend" className="space-y-4 pt-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Xu hướng truy cập theo thời gian</CardTitle>
              <div className="flex gap-2">
                <div className="text-xs bg-muted px-2 py-1 rounded-md border">Ngày</div>
                <div className="text-xs text-muted-foreground px-2 py-1 rounded-md cursor-pointer hover:bg-muted">Tuần</div>
                <div className="text-xs text-muted-foreground px-2 py-1 rounded-md cursor-pointer hover:bg-muted">Tháng</div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[350px]" id="trend-chart-container">
                <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                    <BarChart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Tính năng đang được phát triển</p>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Chúng tôi đang hoàn thiện tính năng phân tích xu hướng. Dữ liệu sẽ được cập nhật trong thời gian tới.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Nhận thông báo khi hoàn thành
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OccaAnalytics;
