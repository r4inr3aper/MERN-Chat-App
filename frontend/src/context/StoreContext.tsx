import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface StoreContextType {
  url: string;
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const StoreContext = createContext<StoreContextType | null>(null);

interface StoreContextProviderProps {
  children: ReactNode;
}

const StoreContextProvider: React.FC<StoreContextProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const url = "http://localhost:5000";

  const handleSetToken = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await axios.post(`${url}/api/user/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToken(null);
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const contextValue: StoreContextType = {
    url,
    token,
    setToken: handleSetToken,
    logout,
    isAuthenticated,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
