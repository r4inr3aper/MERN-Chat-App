import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  email: string;
  pic?: string;
  isAdmin: boolean;
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
  groups: Chat[];
  setGroups: (groups: Chat[]) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isAdmin: boolean;
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
  groups: [],
  setGroups: () => {},
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  isAdmin: false,
});

interface StoreContextProviderProps {
  children: ReactNode;
}

const StoreContextProvider: React.FC<StoreContextProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [groups, setGroups] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // State for isAdmin
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
      setSelectedChat(null);
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setIsAdmin(false); 
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
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${url}/api/user/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const userData = response.data.user;
          setIsAdmin(userData.isAdmin);
        } catch (error) {
          console.error("Error fetching user data:", error);
          logout(); 
        }
      };
      fetchUserData();
    } else {
      navigate("/signup");
    }
  }, [navigate, token]);

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
    groups,
    setGroups,
    isAdmin,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
