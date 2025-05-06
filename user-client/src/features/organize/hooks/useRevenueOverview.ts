import { useState, useEffect } from 'react';
import { analyticsTrendService, RevenueOverviewData } from '../services/analytics-trend.service';

/**
 * Hook for fetching revenue overview data
 */
export const useRevenueOverview = (dateRange: [Date, Date] | null) => {
  const [data, setData] = useState<RevenueOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRevenueOverview = async () => {
      if (!dateRange) {
        setError(new Error('Date range is required'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [from, to] = dateRange;

        if (from instanceof Date && to instanceof Date) {
          const revenueData = await analyticsTrendService.getRevenueOverview(dateRange);
          
          if (isMounted) {
            setData(revenueData);
            setError(null);
          }
        } else {
          throw new Error('Invalid date range: dates must be Date objects');
        }
      } catch (err) {
        console.error('Failed to fetch revenue overview data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRevenueOverview();

    return () => {
      isMounted = false;
    };
  }, [dateRange]);

  return { data, loading, error };
};
