import { useEffect, useState, useCallback } from 'react';
import { roleService } from '../services/role.service';
import { clearAdminStatus } from '../utils/role-utils';

interface UseAdminRoleResult {
  isAdmin: boolean | null;
  isLoading: boolean;
  error: Error | null;
  checkAdminRole: () => Promise<void>;
}

/**
 * Hook to check if the current user has admin role
 * @param pollInterval If provided, set up polling to check admin status at specified interval (ms)
 */
export function useAdminRole(pollInterval?: number): UseAdminRoleResult {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const checkAdminRole = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clear admin status cache to force a fresh check
      clearAdminStatus();
      
      // Force a fresh API call by skipping cache
      const hasAdminRole = await roleService.isAdmin(true);
      setIsAdmin(hasAdminRole);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error checking admin role'));
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkAdminRole();
    
    // Set up interval if requested
    if (pollInterval) {
      const intervalId = setInterval(checkAdminRole, pollInterval);
      return () => clearInterval(intervalId);
    }
  }, [checkAdminRole, pollInterval]);

  return { isAdmin, isLoading, error, checkAdminRole };
}
