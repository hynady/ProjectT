import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
import CookieManager from "@/commons/lib/utils/cookieManager";
import {useNavigate} from "react-router-dom";
import { clearAdminStatus } from "./utils/role-utils";

interface AuthContextProps {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Kiểm tra authentication status khi component mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = CookieManager.getAuthToken();
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken: string) => {
    CookieManager.setAuthToken(newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    navigate('/');
  };  const logout = () => {
    CookieManager.removeAuthToken();
    setToken(null);
    setIsAuthenticated(false);
    
    // Clear any user role/admin status from sessionStorage
    clearAdminStatus();
    
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
    isAuthenticated,
      token,
      login,
      logout,
      loading
  }}
>
  {children}
  </AuthContext.Provider>
);
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};