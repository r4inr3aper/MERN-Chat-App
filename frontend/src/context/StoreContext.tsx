import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Define types for context
interface User {
  _id: string;
  name: string;
  email: string;
  pic?: string;
}

interface Chat {
  _id: string;
  isGroupChat: boolean;
  chatName?: string;
  users: User[];
}

interface StoreContextType {
  url: string;
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const StoreContext = createContext<StoreContextType>({
  url: "http://localhost:5000",
  token: null,
  setToken: () => {},
  logout: () => {},
  isAuthenticated: false,
  selectedChat: null,
  setSelectedChat: () => {},
  chats: [],
  setChats: () => {},
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
});

interface StoreContextProviderProps {
  children: ReactNode;
}

const StoreContextProvider: React.FC<StoreContextProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const url = "http://localhost:5000";

  const handleSetToken = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await axios.post(
        `${url}/api/user/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setToken(null);
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      navigate("/signup");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    } else {
      navigate("/signup");
    }
  }, [navigate]);

  const contextValue: StoreContextType = {
    url,
    token,
    setToken: handleSetToken,
    logout,
    isAuthenticated,
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    isSidebarOpen,
    setIsSidebarOpen,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
