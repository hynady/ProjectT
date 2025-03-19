import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/features/auth/contexts.tsx";
import { useEffect, useState } from 'react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Đợi một khoảng thời gian ngắn để đảm bảo auth state được load
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Hiển thị một giao diện loading trong khi kiểm tra auth
  if (isChecking) {
    return <div></div>; // hoặc component loading spinner
  }

  // Sau khi đã kiểm tra xong, nếu không được xác thực thì chuyển hướng về /
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};