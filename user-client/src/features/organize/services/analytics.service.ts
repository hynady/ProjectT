import { BaseService } from '@/commons/base.service';

// Define analytics data interfaces
export interface OccaAnalyticsData {
  totalReach: number;
  sources: Record<string, number>;
}

class AnalyticsService extends BaseService {
  private static instance: AnalyticsService;

  private constructor() {
    super();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Get analytics data for a specific occa
   * @param occaId The ID of the occa to get analytics for
   * @returns Analytics data containing total reach and sources
   */
  public getOccaAnalytics(occaId: string): Promise<OccaAnalyticsData> {
    return this.request({
      method: 'GET',
      url: `/organize/analytics/${occaId}`,
      mockResponse: () => new Promise<OccaAnalyticsData>((resolve) => {
        // Generate mock data for testing
        const mockSources = {
          'home': Math.floor(Math.random() * 100) + 50,
          'search': Math.floor(Math.random() * 80) + 30,
          'recommended': Math.floor(Math.random() * 60) + 20,
          'social': Math.floor(Math.random() * 40) + 10,
          'email': Math.floor(Math.random() * 30) + 5
        };
        
        const totalReach = Object.values(mockSources).reduce((sum, val) => sum + val, 0);
        
        console.log('Mock getting analytics data for occa:', occaId);
        setTimeout(() => resolve({
          totalReach,
          sources: mockSources
        }), 800);
      }),
      defaultValue: { totalReach: 0, sources: {} }
    });
  }
}

export const analyticsService = AnalyticsService.getInstance();
