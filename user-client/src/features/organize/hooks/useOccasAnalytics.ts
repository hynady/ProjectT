import { useState, useEffect, useCallback } from 'react';
import { analyticsTrendService, OccaAnalyticsData } from '../services/analytics-trend.service';

interface OccasAnalyticsResult {
  data: OccaAnalyticsData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UseOccasAnalyticsOptions {
  page?: number;
  pageSize?: number;
  sortField?: keyof OccaAnalyticsData;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Hook for fetching all occas analytics data and sharing data with other hooks
 */
export const useOccasAnalytics = (
  dateRange: [Date, Date] | null,
  options: UseOccasAnalyticsOptions = {}
) => {
  const { page = 1, pageSize = 10, sortField = 'reach', sortOrder = 'desc' } = options;
  
  const [data, setData] = useState<OccasAnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [allData, setAllData] = useState<OccaAnalyticsData[]>([]);
  
  // Fetch the data for all occas
  const fetchOccasAnalytics = useCallback(async () => {
    if (!dateRange) {
      setError(new Error('Date range is required'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      if (dateRange[0] instanceof Date && dateRange[1] instanceof Date) {
        const occasData = await analyticsTrendService.getAllOccasAnalytics(
          dateRange,
          page,
          pageSize,
          sortField,
          sortOrder
        );
        
        setData(occasData);
        
        // The top events will be the first page of sorted data
        // No need for a separate call to the server
        setAllData(occasData.data);
        
        setError(null);
      } else {
        throw new Error('Invalid date range: dates must be Date objects');
      }
    } catch (err) {
      console.error('Failed to fetch occas analytics data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [dateRange, page, pageSize, sortField, sortOrder]);
  
  useEffect(() => {
    fetchOccasAnalytics();
  }, [fetchOccasAnalytics]);

  // Return the paginated data and the function to get top occas
  return { 
    data, 
    loading, 
    error,
    allData
  };
};

/**
 * Hook for accessing top occas analytics data from the main data source
 */
export const useTopOccasAnalytics = (
  dateRange: [Date, Date] | null,
  limit: number = 5,
  sortField: keyof OccaAnalyticsData = 'reach'
) => {
  const {
    allData,
    loading,
    error
  } = useOccasAnalytics(dateRange, {
    page: 1,
    pageSize: Math.max(limit, 10),
    sortField,
    sortOrder: 'desc'
  });
  
  const data = allData.slice(0, limit);
  
  return { data, loading, error };
};
