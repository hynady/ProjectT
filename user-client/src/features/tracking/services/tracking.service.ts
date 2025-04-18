import { BaseService } from '@/commons/base.service';

export interface UserInteractionData {
  occaId?: string;
  source?: string; // home, search, etc.
  locationId?: string;
  categoryId?: string;
  timestamp: Date;
  action: string; // view, click, etc.
}

// Cập nhật interface để phù hợp với cấu trúc dữ liệu mới
export interface UserInterestStats {
  topOccas: Array<{
    occaId: string,
    sources: Record<string, number>,
    totalCount: number
  }>;
  topLocations?: Array<{locationId: string, count: number}>;
  topCategories?: Array<{categoryId: string, count: number}>;
}

class TrackingService extends BaseService {
  private static instance: TrackingService;
  private interactions: UserInteractionData[] = [];
  private debounceTimers: Record<string, NodeJS.Timeout> = {};
  private lastStatsSent: number = 0; // timestamp for last sent stats
  private updateThreshold: number = 30 * 1000; // 30 seconds

  private constructor() {
    super();
  }

  public static getInstance(): TrackingService {
    if (!TrackingService.instance) {
      TrackingService.instance = new TrackingService();
    }
    return TrackingService.instance;
  }

  /**
   * Track a user interaction with an event
   */
  public trackEventInteraction(data: UserInteractionData): void {
    this.interactions.push(data);
    
    // Debounce sending stats by 5 seconds
    this.debounceUpdate('event-interaction');
  }

  /**
   * Track a user interaction with a location
   */
  public trackLocationInteraction(locationId: string): void {
    this.interactions.push({
      locationId,
      timestamp: new Date(),
      action: 'click'
    });
    
    this.debounceUpdate('location-interaction');
  }

  /**
   * Track a user interaction with a category
   */
  public trackCategoryInteraction(categoryId: string): void {
    this.interactions.push({
      categoryId,
      timestamp: new Date(),
      action: 'click'
    });
    
    this.debounceUpdate('category-interaction');
  }

  /**
   * Debounce processing and sending updates
   */
  private debounceUpdate(key: string): void {
    if (this.debounceTimers[key]) {
      clearTimeout(this.debounceTimers[key]);
    }

    this.debounceTimers[key] = setTimeout(() => {
      this.processAndSendUpdates();
      delete this.debounceTimers[key];
    }, 5000);
  }  /**
   * Process tracked interactions and send statistics to server
   */
  private processAndSendUpdates(): void {
    const now = Date.now();
    
    // Tính toán thống kê từ dữ liệu đã thu thập
    const stats = this.calculateUserStats();
      // Chỉ gửi dữ liệu nếu có thông tin có ý nghĩa 
    // VÀ (đã đủ thời gian từ lần gửi cuối HOẶC có thay đổi đáng kể trong dữ liệu)
    if (stats.topOccas.length > 0 && 
        (now - this.lastStatsSent >= this.updateThreshold || this.hasSignificantChanges())) {
      this.sendStatsToServer(stats);
      this.lastStatsSent = now;
      
      // Xóa tất cả các tương tác đã xử lý để lần sau tính toán lại từ đầu
      this.clearTracking();
    }
  }

  /**
   * Calculate user statistics from tracked interactions
   */
  private calculateUserStats(): UserInterestStats {
    // Cấu trúc mới: nhóm theo occaId, mỗi occaId sẽ chứa danh sách sources và counts
    const occaCounts: Record<string, { 
      occaId: string, 
      sources: Record<string, number>,
      totalCount: number 
    }> = {};
    const locationCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    
    // Filter to more recent interactions (last 7 days)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);
    const recentInteractions = this.interactions.filter(i => 
      i.timestamp.getTime() > recentDate.getTime()
    );

    // Process each interaction
    recentInteractions.forEach(interaction => {
      // Process occaId and source - nhóm theo occaId
      if (interaction.occaId) {
        const occaId = interaction.occaId;
        const source = interaction.source || 'unknown';
        
        // Tạo entry mới nếu occaId chưa tồn tại
        if (!occaCounts[occaId]) {
          occaCounts[occaId] = { 
            occaId: occaId,
            sources: {},
            totalCount: 0
          };
        }
        
        // Khởi tạo source nếu chưa tồn tại
        if (!occaCounts[occaId].sources[source]) {
          occaCounts[occaId].sources[source] = 0;
        }
        
        // Tăng số lượng cho source cụ thể và tổng số
        occaCounts[occaId].sources[source]++;
        occaCounts[occaId].totalCount++;
      }
      
      // Process location
      if (interaction.locationId) {
        const key = interaction.locationId;
        locationCounts[key] = (locationCounts[key] || 0) + 1;
      }
      
      // Process category
      if (interaction.categoryId) {
        const key = interaction.categoryId;
        categoryCounts[key] = (categoryCounts[key] || 0) + 1;
      }
    });
    
    // Chọn top 5 occas theo tổng số lượng nhưng giữ nguyên cấu trúc dữ liệu gốc
    const topOccas = Object.values(occaCounts)
      // Sắp xếp theo tổng số lượng
      .sort((a, b) => b.totalCount - a.totalCount)
      // Lấy top 5 occas
      .slice(0, 5);
    
    const topLocations = Object.entries(locationCounts)
      .map(([locationId, count]) => ({ locationId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    const topCategories = Object.entries(categoryCounts)
      .map(([categoryId, count]) => ({ categoryId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const stats: UserInterestStats = {
      topOccas
    };
    
    // Only include location and category for logged in users
    // (The auth check will happen where this method is called)
    if (topLocations.length > 0) {
      stats.topLocations = topLocations;
    }
    
    if (topCategories.length > 0) {
      stats.topCategories = topCategories;
    }
    
    return stats;
  }
  /**
   * Kiểm tra xem có thay đổi đáng kể trong dữ liệu tracking để gửi ngay lập tức hay không
   * @returns true nếu có thay đổi đáng kể cần gửi ngay lập tức
   */
  private hasSignificantChanges(): boolean {
    // Nếu đây là lần đầu tiên gửi dữ liệu, coi là có thay đổi đáng kể
    if (this.lastStatsSent === 0) {
      return true;
    }

    // Nếu có nhiều tương tác (>5) từ lần cuối gửi, coi là đáng kể
    if (this.interactions.filter(i => i.timestamp.getTime() > this.lastStatsSent).length > 5) {
      return true;
    }

    // Nếu có tương tác với sự kiện hoặc nguồn mới kể từ lần gửi cuối cùng
    const recentOccaIds = new Set<string>();
    const recentSources = new Set<string>();
    
    this.interactions
      .filter(i => i.timestamp.getTime() > this.lastStatsSent && i.occaId)
      .forEach(i => {
        if (i.occaId) recentOccaIds.add(i.occaId);
        if (i.source) recentSources.add(i.source);
      });
    
    // Nếu có > 3 sự kiện mới hoặc > 2 nguồn mới, coi là đáng kể
    if (recentOccaIds.size > 3 || recentSources.size > 2) {
      return true;
    }

    return false;
  }

  /**
   * Send statistics to server
   */
  private sendStatsToServer(stats: UserInterestStats): void {
    this.request({
      method: 'POST',
      url: '/tracking',
      data: stats,
      mockResponse: () => new Promise<void>((resolve) => {
        console.log('Mock sending user statistics to server:', stats);
        setTimeout(() => resolve(), 200);
      }),
      defaultValue: undefined
    });
  }
  
  /**
   * Clear all tracked interactions
   */
  public clearTracking(): void {
    this.interactions = [];
  }
}

export const trackingService = TrackingService.getInstance();
