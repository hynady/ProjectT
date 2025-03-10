import { useState, useEffect } from 'react';
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
  const { isAuthenticated } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await userService.getCurrentUser();
        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  // Get formatted display name
  const displayName = userData?.name || userData?.email?.split('@')[0] || '';
  
  // Get avatar URL with fallback
  const avatarUrl = getAvatarUrl(displayName, userData?.avatar);

  return {
    userData,
    loading,
    error,
    displayName,
    avatarUrl,
  };
}
