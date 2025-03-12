import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

interface UserContextType {
  userData: UserData | null;
  loading: boolean;
  error: Error | null;
  displayName: string;
  avatarUrl: string;
  showProfileCompletion: boolean;
  dismissProfileCompletion: () => void;
  isProfileComplete: boolean;
  refreshUserData: () => Promise<void>;
  refreshTrigger: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
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
      setUserData(null);
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
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

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

  const value = {
    userData,
    loading,
    error,
    displayName,
    avatarUrl,
    showProfileCompletion,
    dismissProfileCompletion,
    isProfileComplete,
    refreshUserData: fetchUserData,
    refreshTrigger
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}