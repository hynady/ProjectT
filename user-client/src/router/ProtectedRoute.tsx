import { Navigate } from 'react-router-dom';
import {useAuth} from "@/features/auth/contexts.tsx";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};