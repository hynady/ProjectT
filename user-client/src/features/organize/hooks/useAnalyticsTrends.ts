import { useState, useEffect } from 'react';
import { analyticsTrendService, TrendData } from '../services/analytics-trend.service';

/**
 * Hook for fetching visitor trend data
 */
export const useAnalyticsTrends = (dateRange: [Date, Date] | null) => {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;

    const fetchTrends = async () => {
      if (!dateRange) {
        setError(new Error('Date range is required'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [from, to] = dateRange;

        if (from instanceof Date && to instanceof Date) {
          // Using the new service method specific for visitor trends
          const trendData = await analyticsTrendService.getVisitorTrendByDateRange(from, to);
          
          if (isMounted) {
            setData(trendData);
            setError(null);
          }
        } else {
          throw new Error('Invalid date range: dates must be Date objects');
        }
      } catch (err) {
        console.error('Failed to fetch visitor trend data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTrends();

    return () => {
      isMounted = false;
    };
  }, [dateRange]);

  return { data, loading, error };
};
