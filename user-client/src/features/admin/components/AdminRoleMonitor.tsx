import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkAdminAccess as checkAdminRole } from '@/features/auth/utils/role-utils';
import { useAuth } from '@/features/auth/contexts';
import { toast } from '@/commons/hooks/use-toast';

/**
 * Component to monitor admin role status and redirect to home page if admin access is lost
 */
export function AdminRoleMonitor() {
  const navigate = useNavigate();
  const location = useLocation();
  const checkIntervalRef = useRef<number | null>(null);
  const { isAuthenticated } = useAuth();
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  // Extract the current path to check if we're in an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Skip checks if not authenticated
    if (!isAuthenticated) {
      return;
    }

    const checkAdminAccess = async () => {
      try {        // Force a fresh check by bypassing cache
        const hasAdminRole = await checkAdminRole(true);
        
        if (isAdminRoute && !hasAdminRole) {
          // User doesn't have admin role but is in admin route, redirect to home and notify
          if (!isInitialCheck) {
            toast({
              title: "Access Denied",
              description: "Your admin privileges have been revoked. You've been redirected to the home page.",
              variant: "destructive",
            });
          }
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        // For safety, redirect if in admin route
        if (isAdminRoute) {
          if (!isInitialCheck) {
            toast({
              title: "Error",
              description: "Failed to verify admin access. Redirecting to home page.",
              variant: "destructive",
            });
          }
          navigate('/', { replace: true });
        }
      }

      // After first check, update flag
      if (isInitialCheck) {
        setIsInitialCheck(false);
      }
    };

    // Run admin check immediately
    checkAdminAccess();

    // Clear any existing check interval
    if (checkIntervalRef.current) {
      window.clearInterval(checkIntervalRef.current);
    }

    // Set up regular role checks (every 30 seconds)
    checkIntervalRef.current = window.setInterval(checkAdminAccess, 30000);

    // Clean up interval on unmount or route change
    return () => {
      if (checkIntervalRef.current) {
        window.clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [navigate, isAdminRoute, isAuthenticated, isInitialCheck]);

  // This is a monitoring component that doesn't render anything
  return null;
}
