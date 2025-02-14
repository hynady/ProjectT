import { useState, useEffect } from 'react';

export function useDelayedLoading(isLoading: boolean, minDuration = 500) {
  const [delayedLoading, setDelayedLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setDelayedLoading(true);
      return;
    }

    const timer = setTimeout(() => {
      setDelayedLoading(false);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [isLoading, minDuration]);

  return delayedLoading;
}