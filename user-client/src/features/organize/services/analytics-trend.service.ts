import { BaseService } from '@/commons/base.service';
import { format } from 'date-fns';

export interface AnalyticsOverviewData {
  totalReach: number;
  sourceDistribution: {
    name: string;
    count: number;
  }[];
  period: {
    from: Date;
    to: Date;
  };
}

export interface RevenueOverviewData {
  totalRevenue: number;
  revenueDistribution: {
    name: string;
    amount: number;
  }[];
  period: {
    from: Date;
    to: Date;
  };
}

export interface OccaAnalyticsData {
  id: string;
  title: string;
  reach: number;
  revenue: number;
  fillRate: number;
  capacity?: number;
}

export interface TrendData {
  date: string;
  visitors: number;
}

export interface RevenueTrendData {
  date: string;
  revenue: number;
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
  }  /**
   * Get analytics overview data (visitor summary)
   * @param dateRange Date range for analytics
   */
  public getOverviewAnalytics(dateRange: [Date, Date]): Promise<AnalyticsOverviewData> {
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
      mockResponse: () => new Promise<AnalyticsOverviewData>((resolve) => {
        const periodRange = { from, to };

        // Tính số ngày giữa from và to
        const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
        
        // Điều chỉnh totalReach dựa trên khoảng thời gian
        const avgDailyReach = 180; // Trung bình mỗi ngày
        const totalReach = Math.floor(avgDailyReach * daysDiff * (0.8 + Math.random() * 0.4)); // Thêm độ biến thiên ±20%
        
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
            sourceDistribution,
            period: periodRange
          });
        }, 1000);
      })
    });
  }
  
  /**
   * Get revenue overview data (revenue summary)
   * @param dateRange Date range for analytics
   */  public getRevenueOverview(dateRange: [Date, Date]): Promise<RevenueOverviewData> {
    const [fromDate, toDate] = dateRange;
    
    // Set from date to start of day (00:00:00)
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    
    // Set to date to end of day (23:59:59)
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return this.request({
      method: 'GET',
      url: `/organize/analytics/revenue/overview?from=${from.toISOString()}&to=${to.toISOString()}`,
      mockResponse: () => new Promise<RevenueOverviewData>((resolve) => {
        const periodRange = { from, to };

        // Tính số ngày giữa from và to
        const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate total revenue
        const avgDailyRevenue = 5000000; // Average daily revenue (5M VND)
        const totalRevenue = Math.floor(avgDailyRevenue * daysDiff * (0.8 + Math.random() * 0.4));
        
        // Revenue distribution by event category
        const revenueCategories = [
          { name: 'Workshop', ratio: 0.25 },
          { name: 'Âm nhạc', ratio: 0.35 },
          { name: 'Triển lãm', ratio: 0.2 },
          { name: 'Lễ hội', ratio: 0.15 },
          { name: 'Hội nghị', ratio: 0.05 }
        ];
        
        const revenueDistribution = revenueCategories.map(category => ({
          name: category.name,
          amount: Math.floor(totalRevenue * category.ratio * (0.8 + Math.random() * 0.4))
        }));

        setTimeout(() => {
          resolve({
            totalRevenue,
            revenueDistribution,
            period: periodRange
          });
        }, 1000);
      })
    });
  }

  /**
   * Get all occas analytics data with pagination
   * @param dateRange Date range for analytics
   * @param page Page number
   * @param pageSize Number of items per page
   * @param sortField Field to sort by
   * @param sortOrder Sort order (asc or desc)
   */
  public getAllOccasAnalytics(
    dateRange: [Date, Date], 
    page: number = 1, 
    pageSize: number = 10,
    sortField: keyof OccaAnalyticsData = 'reach',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{
    data: OccaAnalyticsData[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const [fromDate, toDate] = dateRange;
    
    // Set from date to start of day (00:00:00)
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    
    // Set to date to end of day (23:59:59)
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return this.request({
      method: 'GET',
      url: `/organize/analytics/occas?from=${from.toISOString()}&to=${to.toISOString()}&page=${page}&pageSize=${pageSize}&sortField=${sortField}&sortOrder=${sortOrder}`,
      mockResponse: () => new Promise((resolve) => {
        // Generate mock data for all occas
        const eventList = [
          { id: 'org-1', title: 'Workshop Làm Gốm Sứ', capacity: 50 },
          { id: 'org-2', title: 'Âm Nhạc Đương Đại', capacity: 500 },
          { id: 'org-3', title: 'Triển Lãm Nhiếp Ảnh', capacity: 200 },
          { id: 'org-4', title: 'Lễ Hội Pháo Hoa', capacity: 1000 },
          { id: 'org-5', title: 'Hội Nghị Công Nghệ', capacity: 300 },
          { id: 'org-6', title: 'Lớp Học Yoga', capacity: 30 },
          { id: 'org-7', title: 'Festival Âm Nhạc Mùa Hè', capacity: 800 },
          { id: 'org-8', title: 'Tiệc Cocktail Giao Lưu', capacity: 150 },
          { id: 'org-9', title: 'Hội Thảo Start-up', capacity: 120 },
          { id: 'org-10', title: 'Buổi Ra Mắt Sách', capacity: 80 },
          { id: 'org-11', title: 'Workshop Vẽ Tranh', capacity: 40 },
          { id: 'org-12', title: 'Triển Lãm Công Nghệ', capacity: 250 },
          { id: 'org-13', title: 'Hội Chợ Ẩm Thực', capacity: 500 },
          { id: 'org-14', title: 'Đêm Nhạc Acoustic', capacity: 120 },
          { id: 'org-15', title: 'Workshop Thiết Kế Đồ Họa', capacity: 60 }
        ];

        // Calculate total reach value to be used as base
        const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
        const totalBaseReach = 180 * daysDiff;

        // Generate analytics data for each event
        const allOccas = eventList.map(event => {
          const reach = Math.floor((totalBaseReach / eventList.length) * (0.5 + Math.random()));
          const fillRate = Math.min(95, Math.floor(Math.random() * 100)); // Fill rate percentage (0-95%)
          const ticketsSold = Math.floor((event.capacity * fillRate) / 100);
          const avgTicketPrice = Math.floor(100000 + Math.random() * 500000); // Average ticket price 100k-600k VND
          const revenue = ticketsSold * avgTicketPrice;
          
          return {
            ...event,
            reach,
            revenue,
            fillRate
          };
        });

        // Sort data
        const sortedData = [...allOccas].sort((a, b) => {
          if (sortOrder === 'asc') {
            return a[sortField] > b[sortField] ? 1 : -1;
          } else {
            return a[sortField] < b[sortField] ? 1 : -1;
          }
        });

        // Paginate data
        const total = sortedData.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

        setTimeout(() => {
          resolve({
            data: paginatedData,
            total,
            page,
            pageSize,
            totalPages
          });
        }, 800);
      })
    });
  }
  /**
   * Get revenue trend data for a specific date range
   * @param from Start date
   * @param to End date
   */  public getRevenueTrendByDateRange(fromDate: Date, toDate: Date): Promise<RevenueTrendData[]> {
    // Set from date to start of day (00:00:00)
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    
    // Set to date to end of day (23:59:59)
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return this.request({
      method: 'GET',
      url: `/tickets/analytics/revenue/trend?from=${from.toISOString()}&to=${to.toISOString()}`,
      mockResponse: () => new Promise<RevenueTrendData[]>((resolve) => {
        // For daily view, show data by day
        const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
        const data = Array.from({ length: daysDiff + 1 }, (_, i) => {
          const date = new Date(from);
          date.setDate(date.getDate() + i);
          
          // Create random revenue with natural trends
          const baseRevenue = 5000000; // Base revenue per day (5M VND)
          const trend = Math.sin(i / 7 * Math.PI) * baseRevenue * 0.3; // Weekly trend
          const random = (Math.random() - 0.5) * baseRevenue * 0.5;
          
          return {
            date: format(date, 'dd/MM'),
            revenue: Math.max(0, Math.floor(baseRevenue + trend + random))
          };
        });

        setTimeout(() => resolve(data), 800);
      })
    });
  }

  /**
   * Get visitor trend data for a specific date range
   * @param from Start date
   * @param to End date
   */
  public getVisitorTrendByDateRange(fromDate: Date, toDate: Date): Promise<TrendData[]> {
    // Set from date to start of day (00:00:00)
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    
    // Set to date to end of day (23:59:59)
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return this.request({
      method: 'GET',
      url: `/organize/analytics/visitors/trend?from=${from.toISOString()}&to=${to.toISOString()}`,
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
