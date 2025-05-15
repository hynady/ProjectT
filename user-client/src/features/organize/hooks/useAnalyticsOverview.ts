import { useState, useEffect } from 'react';
import { analyticsTrendService, AnalyticsOverviewData } from '../services/analytics-trend.service';

/**
 * Hook for fetching analytics overview data
 */
export const useAnalyticsOverview = (dateRange: [Date, Date] | null) => {
  const [data, setData] = useState<AnalyticsOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOverview = async () => {
      if (!dateRange) {
        setError(new Error('Date range is required'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [from, to] = dateRange;

        if (from instanceof Date && to instanceof Date) {
          const overviewData = await analyticsTrendService.getOverviewAnalytics(dateRange);
          
          if (isMounted) {
            setData(overviewData);
            setError(null);
          }
        } else {
          throw new Error('Invalid date range: dates must be Date objects');
        }
      } catch (err) {
        console.error('Failed to fetch overview data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOverview();

    return () => {
      isMounted = false;
    };
  }, [dateRange]);

  return { data, loading, error };
};
