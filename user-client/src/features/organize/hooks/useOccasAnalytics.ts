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
  const { pageSize = 10, sortField = 'reach', sortOrder = 'desc' } = options;
  
  const [data, setData] = useState<OccasAnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [allData, setAllData] = useState<OccaAnalyticsData[]>([]);
  
  // Fetch single page of data 
  const fetchPage = useCallback(async (pageNum: number) => {
    const ocasData = await analyticsTrendService.getAllOccasAnalytics(
      dateRange!,
      pageNum,
      pageSize,
      sortField,
      sortOrder
    );
    return ocasData;
  }, [dateRange, pageSize, sortField, sortOrder]);

  // Fetch all pages  
  const fetchAllPages = useCallback(async () => {
    const firstPage = await fetchPage(1);
    const totalPages = firstPage.totalPages;

    // First page data
    const allOccas = [...firstPage.data];
    setData(firstPage);

    // Fetch remaining pages in parallel
    if (totalPages > 1) {
      const pagePromises = [];
      for (let i = 2; i <= totalPages; i++) {
        pagePromises.push(fetchPage(i));
      }

      const remainingPages = await Promise.all(pagePromises);
      remainingPages.forEach(page => {
        allOccas.push(...page.data); 
      });
    }

    setAllData(allOccas);
  }, [fetchPage]);

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
        await fetchAllPages();
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
  }, [dateRange, fetchAllPages]);

  useEffect(() => {
    fetchOccasAnalytics();
  }, [fetchOccasAnalytics]);

  // Return the paginated data and complete data
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
    pageSize: Math.max(limit, 10),
    sortField,
    sortOrder: 'desc'
  });
  
  const data = allData.slice(0, limit);
  
  return { data, loading, error };
};
