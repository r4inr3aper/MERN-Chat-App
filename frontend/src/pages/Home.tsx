import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";
import ChatBox from "../components/ChatBox";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

interface LoggedUser {
  _id: string;
  name: string;
  email: string;
  pic?: string;
}

interface SenderOtherUserInfo {
  sender: { name: string; email: string };
  other: { name: string; email: string };
}

const getUsersInfo = (
  loggedUser: LoggedUser | null,
  users: User[]
): SenderOtherUserInfo => {
  if (!loggedUser || !users) {
    return {
      sender: { name: "Unknown", email: "Unknown" },
      other: { name: "Unknown", email: "Unknown" },
    };
  }

  const sender = users[0]?._id === loggedUser?._id ? users[0] : users[1];
  const otherUser = users[0]?._id === loggedUser?._id ? users[1] : users[0];

  return {
    sender: { name: sender.name, email: sender.email },
    other: { name: otherUser.name, email: otherUser.email },
  };
};

const Home: React.FC = () => {
  const {
    token,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    url,
    groups,
    setGroups,
  } = useContext(StoreContext);
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(null);
  const [fetchAgain, setFetchAgain] = useState(false);
  const [toggleOption, setToggleOption] = useState<"chats" | "groups">("chats");

  const fetchChats = async () => {
    try {
      const { data } = await axios.get<Chat[]>(`${url}/api/chat`, {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setChats(data);
      console.log("Chats data:", data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data } = await axios.get<Chat[]>(`${url}/api/chat/all`, {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setGroups(data);
      console.log("Groups data:", data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("Logged user from localStorage:", user);
    setLoggedUser(user);
    if (user) {
      fetchChats();
      fetchGroups();
    }
  }, [fetchAgain]);

  const joinGroup = async (groupId: string) => {
    try {
      await axios.put(
        `${url}/api/chat/addself`,
        { chatId: groupId }, // Ensure groupId is correctly passed here
        {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`, // Check if token is valid
          },
        }
      );
      toast.success("Successfully joined group");
      setFetchAgain(!fetchAgain)
    } catch (error) {
      console.error(`Error joining group with ID: ${groupId}`, error);
      toast.error(error.response?.data?.message || "Error joining group");}
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <div className="px-4 w-[30%] h-full bg-[#25262d]">
          <div className="flex space-x-2 bg-[#33353d] p-2 rounded-md my-[2rem]">
            <button
              className={`flex-1 py-2 text-center rounded-md ${ 
                toggleOption === "chats"
                  ? "bg-[#25262d] text-white"
                  : "text-gray-400"
              }`}
              onClick={() => setToggleOption("chats")}
            >
              <span className="text-sm font-medium">Chat</span>
            </button>
            <button
              className={`flex-1 py-2 text-center rounded-md ${
                toggleOption === "groups"
                  ? "bg-[#25262d] text-white"
                  : "text-gray-400"
              }`}
              onClick={() => setToggleOption("groups")}
            >
              <span className="text-sm font-medium">All Groups</span>
            </button>
          </div>
          {toggleOption === "chats" ? (
            <div className="space-y-2 max-h-[32rem] overflow-y-auto custom-scrollbar">
              {chats.length > 0 ? (
                chats.map((chat) => {
                  const { sender } = !chat.isGroupChat
                    ? getUsersInfo(loggedUser, chat.users)
                    : {
                        sender: {
                          name: chat.chatName || "Group Chat",
                          email: "N/A",
                        },
                      };

                  return (
                    <div
                      key={chat._id}
                      className={`p-3 rounded-lg cursor-pointer transition-all bg-[#404048]`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <h3 className="font-medium text-white">{sender.name}</h3>
                      <p className="text-sm text-gray-500">{sender.email}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No chats available</p>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[32rem] overflow-y-auto custom-scrollbar">
              {groups.length > 0 ? (
                groups.map((group) => (
                  <div
                    key={group._id}
                    className={`p-3 rounded-lg cursor-pointer transition-all bg-[#404048] flex justify-between items-center`}
                  >
                    <div>
                      <h3 className="font-medium text-white">
                        {group.chatName || "Group Chat"}
                      </h3>
                    </div>
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded-md"
                      onClick={() => joinGroup(group._id)}
                    >
                      Join
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No groups available</p>
              )}
            </div>
          )}
        </div>

        <div className="w-[70%] p-4 bg-[#2e2f38]">
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </div>
      </div>
    </div>
  );
};

export default Home;
