import React, {createContext, useContext, useState, ReactNode} from "react";

interface AuthContextProps {
  isAuthenticated: boolean; // Trạng thái xác thực
  setAuthenticated: (value: boolean) => void; // Hàm cập nhật trạng thái xác thực
}

const AppContext = createContext<AuthContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({children}) => {
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false); // Trạng thái đăng nhập


  return (
    <AppContext.Provider value={{isAuthenticated, setAuthenticated}}>
        {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AuthContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
