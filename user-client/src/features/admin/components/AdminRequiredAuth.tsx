import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/contexts';
import { useUser } from '@/features/auth/contexts/UserContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { checkAdminAccess, clearAdminStatus } from '@/features/auth/utils/role-utils';

export const AdminRequiredAuth = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { loading: userLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const checkIntervalRef = useRef<number | null>(null);

  // Check admin role on component mount and when auth status changes
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!isAuthenticated) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }      try {
        setLoading(true);
        // Use the utility with force refresh parameter
        const isUserAdmin = await checkAdminAccess(true);
        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error('Error verifying admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    // Immediately check admin role when component mounts
    checkAdminRole();

    // Clear any existing interval
    if (checkIntervalRef.current) {
      window.clearInterval(checkIntervalRef.current);
    }

    // Set up periodic check for admin role (every 30 seconds)
    if (isAuthenticated) {
      checkIntervalRef.current = window.setInterval(async () => {
        try {        // Force a direct API call to check current role
        const isUserAdmin = await checkAdminAccess(true); // Force fresh check
        setIsAdmin(isUserAdmin);
        } catch (error) {
          console.error('Error in periodic admin status check:', error);
          setIsAdmin(false);
        }
      }, 30000);
    }

    // Clean up interval on component unmount
    return () => {
      if (checkIntervalRef.current) {
        window.clearInterval(checkIntervalRef.current);
      }
    };
  }, [isAuthenticated]);

  // Show loading state while checking authentication and admin role
  if (authLoading || userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Redirect to home if user is not admin
  if (!isAdmin) {
    // Clear cached admin status when redirecting
    clearAdminStatus();
    return <Navigate to="/" replace />;
  }
  // If authenticated and is admin, render the protected content
  return <Outlet />;
};
