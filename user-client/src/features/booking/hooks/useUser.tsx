// hooks/useUser.ts
import { useState } from 'react';

interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>({
    id: 'user_01',
    fullName: 'hynady',
    email: 'hynady@example.com',
    createdAt: '2025-01-18 13:58:45'
  });

  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    updateUser,
    logout
  };
};