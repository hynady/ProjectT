import React, {createContext, useContext, useState, ReactNode} from "react";

interface AuthContextProps {
  isAuthenticated: boolean; // Trạng thái xác thực
  setAuthenticated: (value: boolean) => void; // Hàm cập nhật trạng thái xác thực
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({children}) => {
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false); // Trạng thái đăng nhập

  return (
      <AuthContext.Provider value={{isAuthenticated, setAuthenticated}}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
