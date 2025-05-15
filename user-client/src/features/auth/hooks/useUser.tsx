import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/contexts';
import { getAvatarUrl } from '@/utils/cloudinary.utils';
import { userService } from '../services/user.service';

// Define user data interface
export interface UserData {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  username?: string;
}

export function useUser() {
  const { isAuthenticated, logout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [showProfileCompletion, setShowProfileCompletion] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize and check profile completion status
  useEffect(() => {
    if (!isAuthenticated) {
      setShowProfileCompletion(false);
      return;
    }
  }, [isAuthenticated]);

  // Create a fetchUserData function that can be called externally
  const fetchUserData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await userService.getCurrentUser();
      setUserData(data);
      
      // Only show profile completion dialog if name is missing AND not previously dismissed
      const profileCompletionDismissed = localStorage.getItem('profileCompletionDismissed');
      if (profileCompletionDismissed !== 'true' && (!data.name || data.name.trim() === '')) {
        setShowProfileCompletion(true);
      } else {
        setShowProfileCompletion(false);
      }
      
      // Increment the refresh trigger to notify dependent components
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error("Error fetching user data:", err);
      
      // Check if error is unauthorized (401) or user not found (404)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorStatus = (err as any)?.status || (err as any)?.response?.status;
      if (errorStatus === 401 || errorStatus === 404) {
        console.log("User unauthorized or not found. Logging out...");
        logout(); // Auto logout if user data can't be retrieved
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, logout]);

  // Call fetchUserData when the component using this hook mounts or when isAuthenticated changes
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Get formatted display name
  const displayName = userData?.name || userData?.email?.split('@')[0] || '';
  
  // Get avatar URL with fallback
  const avatarUrl = getAvatarUrl(displayName, userData?.avatar);
  
  // Function to dismiss profile completion notification
  const dismissProfileCompletion = () => {
    setShowProfileCompletion(false);
    localStorage.setItem('profileCompletionDismissed', 'true');
  };

  // More robust profile completion check
  const isProfileComplete = !!(userData?.name && userData.name.trim() !== '');

  return {
    userData,
    loading,
    error,
    displayName,
    avatarUrl,
    showProfileCompletion,
    dismissProfileCompletion,
    isProfileComplete,
    refreshUserData: fetchUserData, // Expose the refresh function
    refreshTrigger // Expose the refresh trigger for components to listen to
  };
}
