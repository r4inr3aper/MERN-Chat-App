import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";
import GroupChatBox from "./GroupChatCreate";
import ChatBox from "./ChatBox";

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

const getUsersInfo = (loggedUser: LoggedUser | null, users: User[]): SenderOtherUserInfo => {
  if (!loggedUser || !users) {
    return { sender: { name: "Unknown", email: "Unknown" }, other: { name: "Unknown", email: "Unknown" } };
  }

  const sender = users[0]?._id === loggedUser?._id ? users[0] : users[1];
  const otherUser = users[0]?._id === loggedUser?._id ? users[1] : users[0];

  return {
    sender: { name: sender.name, email: sender.email },
    other: { name: otherUser.name, email: otherUser.email }
  };
};

const MyChats: React.FC = ({fetchAgain, setFetchAgain}) => {
  const { token, chats, setChats, selectedChat, setSelectedChat, url } = useContext(StoreContext);
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(null);
  const [isGroupChatBoxVisible, setIsGroupChatBoxVisible] = useState(false);

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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("Logged user from localStorage:", user);
    setLoggedUser(user);
    if (user) fetchChats();
  }, [fetchAgain]);

  const handleNewGroupChat = () => {
    setIsGroupChatBoxVisible(true);
  };

  const closeGroupChatBox = () => {
    setIsGroupChatBoxVisible(false); 
  };

  return (
    <div className="w-full h-screen flex ">
    <div className="p-4 w-[30%] h-full bg-[#25262d]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Chats</h2>
        <button
          className="cursor-pointer px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleNewGroupChat} 
        >
          New Group Chat
        </button>
      </div>
      
      {isGroupChatBoxVisible && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] md:w-[50%] lg:w-[30%]">
            <button
              className="absolute top-2 right-2 text-xl text-gray-500"
              onClick={closeGroupChatBox} 
            >
              &times;
            </button>
            <GroupChatBox closeOverlay={closeGroupChatBox} />
          </div>
        </div>
      )}

      <div className="space-y-2">
        {chats.length > 0 ? (
          chats.map((chat) => {
            const { sender} = !chat.isGroupChat
              ? getUsersInfo(loggedUser, chat.users)
              : { sender: { name: chat.chatName || "Group Chat", email: "N/A" }}; 

            return (
              <div
                key={chat._id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedChat?._id === chat._id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <h3 className="font-semibold">
                  {sender.name} 
                </h3>
                <p className="text-sm text-gray-500">
                  {sender.email} 
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">No chats available</p>
        )}
      </div>
    </div>
    <div className="w-[70%] p-4">
      <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>
    </div>
    </div>
  );
};

export default MyChats;
