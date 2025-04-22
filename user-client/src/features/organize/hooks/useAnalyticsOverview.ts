import { useState, useEffect } from 'react';
import { analyticsTrendService, AnalyticsTrendData } from '../services/analytics-trend.service';

export const useAnalyticsOverview = (dateRange: [Date, Date] | null) => {
  const [data, setData] = useState<AnalyticsTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      if (!dateRange) {
        setError(new Error('Date range is required'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const overviewData = await analyticsTrendService.getOverviewAnalytics(dateRange);
        setData(overviewData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch overview data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch overview data'));
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [dateRange]);

  return { data, loading, error };
};
