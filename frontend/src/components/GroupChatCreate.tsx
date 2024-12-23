import React, { useState, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";

interface User {
  _id: string;
  name: string;
  email: string;
  pic?: string;
}

interface GroupChatBoxProps {
  closeOverlay: () => void;
}

const GroupChatBox: React.FC<GroupChatBoxProps> = ({ closeOverlay }) => {
  const [groupChatName, setGroupChatName] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");
  const [searchResult, setSearchResult] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { url, setChats, chats } = useContext(StoreContext);
  const token = localStorage.getItem("token");

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get<User[]>(`${url}/api/user/all?search=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSearchResult(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    if (selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroupChat = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      alert("Please enter a group name and select users.");
      return;
    }

    try {
      const { data } = await axios.post(
        `${url}/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChats([data, ...(chats || [])]);
      console.log("Group chat created:", data);
      closeOverlay();
    } catch (error) {
      console.error("Error creating group chat:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Create Group Chat</h2>

      <div className="mb-4">
        <label htmlFor="groupChatName" className="block text-lg">
          Group Chat Name
        </label>
        <input
          type="text"
          id="groupChatName"
          value={groupChatName}
          onChange={(e) => setGroupChatName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter group chat name"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="search" className="block text-lg">
          Add Users
        </label>
        <input
          type="text"
          id="search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Search users..."
        />
        {loading && <p>Loading...</p>}

        {searchResult.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-scroll border border-gray-300 rounded-md">
            {searchResult.map((user) => (
              <div
                key={user._id}
                className="flex justify-between items-center p-2 border-b border-gray-300"
              >
                <div>
                  <span className="font-semibold">{user.name}</span>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <button
                  className={`px-4 py-2 rounded-md ${
                    selectedUsers.find((u) => u._id === user._id)
                      ? "bg-red-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                  onClick={() => handleUserSelect(user)}
                >
                  {selectedUsers.find((u) => u._id === user._id) ? "Remove" : "Add"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Selected Users</h3>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-scroll border border-gray-300 rounded-md p-2">
          {selectedUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center bg-blue-200 p-2 rounded-md"
            >
              <span>{user.name}</span>
              <button
                className="ml-2 text-red-500"
                onClick={() => handleUserSelect(user)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={handleCreateGroupChat}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Group Chat
        </button>
        <button
          onClick={closeOverlay}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GroupChatBox;
