/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, useContext, ReactNode } from 'react';
import { useEventTracking } from '../hooks/useEventTracking';

// Create context with default values
const TrackingContext = createContext({
  trackEventView: (_occaId: string, _source: string) => {},
  trackEventClick: (_occaId: string, _source: string) => {},
  trackLocationClick: (_locationId: string) => {},
  trackCategoryClick: (_category: string,) => {},
});

export const TrackingProvider = ({ children }: { children: ReactNode }) => {
  const trackingFunctions = useEventTracking();
  
  return (
    <TrackingContext.Provider value={trackingFunctions}>
      {children}
    </TrackingContext.Provider>
  );
};

// Custom hook for using tracking functions
export const useTracking = () => useContext(TrackingContext);
