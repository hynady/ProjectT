import { useAuth } from '@/features/auth/contexts';
import { trackingService } from '../services/tracking.service';
import { useCallback } from 'react';

/**
 * Hook for tracking user interactions with events/occas
 */
export const useEventTracking = () => {
  const { isAuthenticated } = useAuth();
  
  const trackEventView = useCallback((occaId: string, source: string) => {
    trackingService.trackEventInteraction({
      occaId,
      source,
      timestamp: new Date(),
      action: 'view'
    });
  }, []);
  
  const trackEventClick = useCallback((occaId: string, source: string) => {
    trackingService.trackEventInteraction({
      occaId,
      source,
      timestamp: new Date(),
      action: 'click'
    });
  }, []);
  
  const trackLocationClick = useCallback((locationId: string) => {
    if (isAuthenticated) {
      trackingService.trackLocationInteraction(locationId);
    }
  }, [isAuthenticated]);
  
  const trackCategoryClick = useCallback((categoryId: string) => {
    if (isAuthenticated) {
      trackingService.trackCategoryInteraction(categoryId);
    }
  }, [isAuthenticated]);
  
  return {
    trackEventView,
    trackEventClick,
    trackLocationClick,
    trackCategoryClick
  };
};
