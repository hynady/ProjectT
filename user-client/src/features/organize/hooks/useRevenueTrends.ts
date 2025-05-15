import { useState, useEffect } from 'react';
import { analyticsTrendService, RevenueTrendData } from '../services/analytics-trend.service';

/**
 * Hook for fetching revenue trend data
 */
export const useRevenueTrends = (dateRange: [Date, Date] | null) => {
  const [data, setData] = useState<RevenueTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;

    const fetchRevenueTrends = async () => {
      if (!dateRange) {
        setError(new Error('Date range is required'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [from, to] = dateRange;

        if (from instanceof Date && to instanceof Date) {
          const revenueTrendData = await analyticsTrendService.getRevenueTrendByDateRange(from, to);
          
          if (isMounted) {
            setData(revenueTrendData);
            setError(null);
          }
        } else {
          throw new Error('Invalid date range: dates must be Date objects');
        }
      } catch (err) {
        console.error('Failed to fetch revenue trend data:', err);
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

    fetchRevenueTrends();

    return () => {
      isMounted = false;
    };
  }, [dateRange]);

  return { data, loading, error };
};
