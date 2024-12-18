import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";

interface User {
  _id: string;
  name: string;
  email: string;
  pic?: string;
}

const Sidebar = () => {
  const { url, token, setSelectedChat, chats, setChats, setIsSidebarOpen } = useContext(StoreContext);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const accessChat = async (userId: string) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${url}/api/chat`,
        { userId },
        {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      setSelectedChat(data);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Error accessing chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${url}/api/user/all?search=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data);
    } catch (error) {
      setError("Failed to fetch users. Please try again later.");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="w-64 bg-white p-4 h-full shadow-lg">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {loading && <div className="text-gray-500 text-sm">Loading...</div>}

      <div className="mt-4 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        {searchResults.length > 0 ? (
          searchResults.map((user: User) => (
            <div
              key={user._id}
              className="p-2 mb-2 bg-gray-100 rounded-md shadow-sm hover:bg-gray-200 cursor-pointer"
              onClick={() => accessChat(user._id)}
            >
              <p className="text-gray-800 font-semibold">{user.name}</p>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
          ))
        ) : (
          !loading && <div className="text-gray-500 text-sm">No users found</div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
