import { Navigate, useLocation } from "react-router-dom";
import React from "react";
import { useAuth } from "@/app/authpage/contexts/AuthContext";

interface AuthRouteProps {
  children: React.ReactNode;
}

// Route này chỉ cho phép truy cập khi CHƯA đăng nhập
const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    // Nếu đã đăng nhập, chuyển về trang chủ
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;