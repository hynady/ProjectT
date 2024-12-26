import { Navigate } from "react-router-dom";
import React from "react";
import {useAppContext} from "@/components/AppContext.tsx";

interface ProtectedRouteProps {
  children: React.ReactNode; // Các component con
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  console.log(isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
