import React, { useContext, useState } from 'react';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface GroupInfoProps {
  setFetchAgain: (fetchAgain: boolean) => void;
  fetchAgain: boolean;
  setSearch: (search: string) => void;
  search: string;
  selectedChat: any;
}

const GroupInfo: React.FC<GroupInfoProps> = ({
  setFetchAgain,
  fetchAgain,
  setInfo,
  info,
  setSearch,
  search,
  selectedChat,
}) => {
  const { token, url } = useContext(StoreContext);
  const [groupName, setGroupName] = useState<string>(selectedChat?.chatName || '');
  const [searchResult, setSearchResult] = useState<User[]>([]);
  const [groupUsers, setGroupUsers] = useState<User[]>(selectedChat?.users || []);

  const handleRenameGroup = async () => {
    if (!groupName.trim() || groupName === selectedChat?.chatName) return;

    try {
      const { data } = await axios.put(
        `${url}/api/chat/rename`,
        { chatId: selectedChat._id, chatName: groupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroupName(data.chatName);
      setFetchAgain(true);
      toast.success('Group renamed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error renaming group!');
    }
  };

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }
    try {
      const { data } = await axios.get<User[]>(`${url}/api/user/all?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResult(data);
    } catch (error) {
      toast.error('Error searching users!');
    }
  };

  const handleAddUser = async (user: User) => {
    if (!selectedChat) return;
    try {
      const { data } = await axios.put(
        `${url}/api/chat/add`,
        { chatId: selectedChat._id, userId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroupUsers(data.users);
      setFetchAgain(true);
      setSearchResult((prev) => prev.filter((u) => u._id !== user._id));
      toast.success(`${user.name} added to the group!`);
    } catch (error) {
      toast.error(error.response?.data?.message ||  `Error adding ${user.name}!`);
    }
  };

  const handleRemoveUser = async (user: User) => {
    if (!selectedChat) return;
    try {
      const { data } = await axios.put(
        `${url}/api/chat/remove`,
        { chatId: selectedChat._id, userId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroupUsers(data.users);
      setFetchAgain(true);
      toast.success(`${user.name} removed from the group!`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Error removing ${user.name}!`);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedChat) return;
    try {
      await axios.delete(`${url}/api/chat/group/${selectedChat._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFetchAgain(true);
      toast.success('Group deleted successfully!');
    } catch (error) {
      const errorMessage = (error as any).response?.data?.message || (error as Error).message;
      toast.error(`Error deleting group: ${errorMessage}`);
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="group-info p-4 bg-[#2c2f36] rounded-md w-full max-w-md h-full max-h-[29rem] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl text-white font-semibold">Group Info</h3>
          <button
          onClick={() => setInfo(!info)}
          className="px-4 py-2 bg-red-600 text-white rounded"
          >
            X
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-white mb-2">Group Name</label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            <button
              onClick={handleRenameGroup}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Rename
            </button>
            <button
              onClick={handleDeleteGroup}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-white mb-2">Search Users</label>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <div className="search-results mt-2">
            {searchResult.map((user) => (
              <div
                key={user._id}
                className="flex justify-between items-center text-white mt-2"
              >
                <span>{user.name}</span>
                <button
                  onClick={() => handleAddUser(user)}
                  className="px-2 py-1 bg-blue-500 rounded text-white"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Group Members</h4>
          {groupUsers.map((user) => (
            <div
              key={user._id}
              className="flex justify-between items-center text-white mt-2"
            >
              <span>{user.name}</span>
              <button
                onClick={() => handleRemoveUser(user)}
                className="px-2 py-1 bg-red-500 rounded text-white"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupInfo;
