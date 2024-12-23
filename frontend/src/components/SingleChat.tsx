import React, { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import GroupInfo from "./GroupInfo";

type Message = {
  _id: string;
  content: string;
  sender: { _id: string; name: string };
  createdAt: string;
  file?: string; 
};

type User = {
  _id: string;
  name: string;
  email: string;
};

const SingleChat: React.FC<{
  fetchAgain: boolean;
  setFetchAgain: (value: boolean) => void;
}> = ({ fetchAgain, setFetchAgain }) => {
  const ENDPOINT = "http://localhost:5000"; 

  const { token, selectedChat, url, setSelectedChat } = useContext(StoreContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [info, setInfo] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>(selectedChat?.chatName || "");
  const [search, setSearch] = useState<string>("");
  const [searchResult, setSearchResult] = useState<User[]>([]);
  const [groupUsers, setGroupUsers] = useState<User[]>(selectedChat?.users || []);
  const [file, setFile] = useState<File | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(ENDPOINT, {
      transports: ["websocket"],
    });

    socketRef.current.on("connected", () => {
      setSocketConnected(true);
    });

    if (selectedChat) {
      socketRef.current.emit("join chat", selectedChat._id);
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [selectedChat]);

  useEffect(() => {
    if (socketConnected) {
      socketRef.current?.on("message received", (newMessageReceived: Message) => {
        if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
          // Handle notification if not in the selected chat
        } else {
          setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
        }
      });
    }

    return () => {
      socketRef.current?.off("message received");
    };
  }, [socketConnected, selectedChat]);

  const fetchMessages = async () => {
    if (!selectedChat) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${url}/api/messages/all/${selectedChat._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !file) || !selectedChat) return;

    try {
      const formData = new FormData();
      formData.append("content", newMessage);
      formData.append("chatId", selectedChat._id);
      if (file) formData.append("file", file);

      const { data } = await axios.post(
        `${url}/api/messages/send`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
      setFile(null);
      setFetchAgain(!fetchAgain);

      socketRef.current?.emit("new message", data);
    } catch (error) {
      toast.error("Error sending message");
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedChat) return;
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    try {
      const { data } = await axios.put(
        `${url}/api/chat/removeSelf`,
        { chatId: selectedChat._id, userId: currentUser._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroupUsers(data.users);
      setFetchAgain(!fetchAgain);
      setSelectedChat(null);
      toast.success("You have left the group!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error occurred while leaving the group!");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  return (
    <div className="h-full flex flex-col">
      <div className="chat-header flex items-center px-4 mt-3 py-3 text-[#ffffff] rounded justify-between w-full bg-[#1c1d22]">
        <h2 className="text-lg font-semibold">
          {selectedChat?.isGroupChat
            ? selectedChat.chatName
            : selectedChat?.users.find(
                (u) =>
                  u._id !== JSON.parse(localStorage.getItem("user") || "{}")._id
              )?.name}
        </h2>
        <div className="flex space-x-5">
          <button
            className="cursor-pointer p-2 bg-[#33353d] text-white rounded"
            onClick={() => setInfo(!info)}
          >
            Info
          </button>
          <button
            className="cursor-pointer p-2 bg-red-700 text-white rounded"
            onClick={handleLeaveGroup}
          >
            Leave Group
          </button>
        </div>
      </div>

      {info ? (
        <GroupInfo
          setFetchAgain={setFetchAgain}
          fetchAgain={fetchAgain}
          setSearch={setSearch}
          search={search}
          selectedChat={selectedChat}
          setSearchResult={setSearchResult}
          setGroupUsers={setGroupUsers}
          setInfo={setInfo}
          info={info}
          groupUsers={groupUsers}
        />
      ) : (
        <div className="messages-section flex-1  overflow-auto max-h-[30rem] p-4">
          {loading ? (
            <h4>Loading...</h4>
          ) : (
            <div className="messages-list space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex items-end ${
                    message.sender._id ===
                    JSON.parse(localStorage.getItem("user") || "{}")._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-white text-sm shadow-md ${
                      message.sender._id ===
                      JSON.parse(localStorage.getItem("user") || "{}")._id
                        ? "bg-blue-600"
                        : "bg-gray-700"
                    }`}
                  >
                    <span className="block font-semibold mb-1">
                      {message.sender.name}
                    </span>
                    {message.content}
                    {message.file && (
                      <div className="mt-2">
                        <a
                          href={message.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400"
                        >
                          View File
                        </a>
                      </div>
                    )}
                    <span className="block text-xs mt-1 text-gray-300">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form
        className="send-message-form w-[67%] top-[88%] fixed flex mt-4"
        onSubmit={sendMessage}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full p-2 rounded text-white bg-[#1c1d22] focus:outline-none"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className="p-2 text-white bg-[#33353d] rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default SingleChat;
