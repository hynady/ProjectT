import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import OccaAnalytics from '../components/OccaAnalytics';
import { Loader2 } from 'lucide-react';

const OccaAnalyticsPage: React.FC = () => {
  const { occaId } = useParams<{ occaId: string }>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state for demonstration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (!occaId) {
    return <div className="p-6">Không tìm thấy sự kiện</div>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Thống kê sự kiện</h1>
      <OccaAnalytics occaId={occaId} />
    </div>
  );
};

export default OccaAnalyticsPage;
