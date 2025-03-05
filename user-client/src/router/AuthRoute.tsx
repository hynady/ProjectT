import { Navigate, useLocation } from "react-router-dom";
import React from "react";
import { useAuth } from "@/features/auth/contexts";

interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Nếu đã đăng nhập
  if (isAuthenticated) {
    // Lấy đường dẫn trước đó từ state, nếu không có thì về homepage
    const from = location.state?.from || "/";
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;