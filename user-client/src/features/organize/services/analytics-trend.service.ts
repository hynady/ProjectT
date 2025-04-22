import { BaseService } from '@/commons/base.service';
import { format } from 'date-fns';

export interface AnalyticsTrendData {
  totalReach: number;
  topOccas: {
    id: string;
    title: string;
    reach: number;
  }[];
  sourceDistribution: {
    name: string;
    count: number;
  }[];
  period: {
    from: Date;
    to: Date;
  };
}

export interface TrendData {
  date: string;
  visitors: number;
}

class AnalyticsTrendService extends BaseService {
  private static instance: AnalyticsTrendService;

  private constructor() {
    super();
  }

  public static getInstance(): AnalyticsTrendService {
    if (!AnalyticsTrendService.instance) {
      AnalyticsTrendService.instance = new AnalyticsTrendService();
    }
    return AnalyticsTrendService.instance;
  }

  /**
   * Get analytics overview data
   */
  public getOverviewAnalytics(dateRange: [Date, Date]): Promise<AnalyticsTrendData> {
    const [fromDate, toDate] = dateRange;
    
    // Set from date to start of day (00:00:00)
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    
    // Set to date to end of day (23:59:59)
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return this.request({
      method: 'GET',
      url: `/organize/analytics/overview?from=${from.toISOString()}&to=${to.toISOString()}`,
      mockResponse: () => new Promise<AnalyticsTrendData>((resolve) => {
        const periodRange = { from, to };

        // Tính số ngày giữa from và to
        const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
        
        // Điều chỉnh totalReach dựa trên khoảng thời gian
        const avgDailyReach = 180; // Trung bình mỗi ngày
        const totalReach = Math.floor(avgDailyReach * daysDiff * (0.8 + Math.random() * 0.4)); // Thêm độ biến thiên ±20%

        // Tạo danh sách sự kiện với reach được tính theo tỷ lệ thời gian
        const eventList = [
          { id: 'org-1', title: 'Workshop Làm Gốm Sứ' },
          { id: 'org-2', title: 'Âm Nhạc Đương Đại' },
          { id: 'org-3', title: 'Triển Lãm Nhiếp Ảnh' },
          { id: 'org-4', title: 'Lễ Hội Pháo Hoa' },
          { id: 'org-5', title: 'Hội Nghị Công Nghệ' }
        ];

        const topOccas = eventList.map(event => ({
          ...event,
          reach: Math.floor((totalReach / eventList.length) * (0.5 + Math.random()))
        })).sort((a, b) => b.reach - a.reach);

        // Tính phân bố nguồn truy cập dựa trên tổng reach
        const sources = [
          { name: 'Trang chủ', ratio: 0.5 },
          { name: 'Tìm kiếm', ratio: 0.3 },
          { name: 'Đề xuất', ratio: 0.15 },
          { name: 'Mạng xã hội', ratio: 0.05 }
        ];

        const sourceDistribution = sources.map(source => ({
          name: source.name,
          count: Math.floor(totalReach * source.ratio * (0.8 + Math.random() * 0.4))
        }));

        setTimeout(() => {
          resolve({
            totalReach,
            topOccas,
            sourceDistribution,
            period: periodRange
          });
        }, 1000);
      })
    });
  }

  /**
   * Get trend data for a specific date range
   * @param from Start date
   * @param to End date
   */
  public getTrendDataByDateRange(fromDate: Date, toDate: Date): Promise<TrendData[]> {
    // Set from date to start of day (00:00:00)
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    
    // Set to date to end of day (23:59:59)
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return this.request({
      method: 'GET',
      url: `/organize/analytics/trends/range?from=${from.toISOString()}&to=${to.toISOString()}`,
      mockResponse: () => new Promise<TrendData[]>((resolve) => {
        // For daily view, show data by day
        const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
        const data = Array.from({ length: daysDiff + 1 }, (_, i) => {
          const date = new Date(from);
          date.setDate(date.getDate() + i);
          
          // Create random visitor counts with natural trends
          const baseVisitors = 200;
          const trend = Math.sin(i / 7 * Math.PI) * 50; // Weekly trend
          const random = (Math.random() - 0.5) * 100;
          
          return {
            date: format(date, 'dd/MM'),
            visitors: Math.max(0, Math.floor(baseVisitors + trend + random))
          };
        });

        setTimeout(() => resolve(data), 800);
      })
    });
  }
}

export const analyticsTrendService = AnalyticsTrendService.getInstance();
