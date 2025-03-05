import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/contexts";

interface ProtectedBookingRouteProps {
  children: React.ReactNode;
}

const ProtectedBookingRoute = ({ children }: ProtectedBookingRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedBookingRoute;