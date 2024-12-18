import React, { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";
import { io, Socket } from "socket.io-client";

type Message = {
  _id: string;
  content: string;
  sender: { _id: string; name: string };
  createdAt: string;
};

const SingleChat: React.FC<{ fetchAgain: boolean; setFetchAgain: (value: boolean) => void }> = ({ fetchAgain, setFetchAgain }) => {
  const ENDPOINT = "http://localhost:5000"; // Ensure this matches the backend URL

  const { token, selectedChat, url } = useContext(StoreContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  
  const socketRef = useRef<Socket | null>(null); // Use useRef to store the socket

  useEffect(() => {
    socketRef.current = io(ENDPOINT, {
      transports: ['websocket'],
    });

    socketRef.current.on("connected", () => {
      console.log("Socket connected!");
      setSocketConnected(true);
    });

    if (selectedChat) {
      socketRef.current.emit("join chat", selectedChat._id);
      console.log("User joined chat room:", selectedChat._id);
    }

    return () => {
      socketRef.current?.disconnect();
      console.log("Socket disconnected");
    };
  }, [selectedChat]);

useEffect(() => {
  if (socketConnected) {
    socketRef.current?.on("message received", (newMessageReceived: Message) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
        console.log("Message received:", newMessageReceived); // Log the received message
        // Handle notification if not in the selected chat
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    });
  }

  return () => {
    if (socketConnected) {
      socketRef.current?.off("message received");
    }
  };
}, [socketConnected, selectedChat]);


  const fetchMessages = async () => {
    if (!selectedChat) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${url}/api/messages/all/${selectedChat._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data } = await axios.post(
        `${url}/api/messages/send`,
        { content: newMessage, chatId: selectedChat._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
      setFetchAgain(!fetchAgain);

      // Emit the new message using the socket reference
      socketRef.current?.emit("new message", data); // Use the ref to emit the message
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  return (
    <div className="single-chat-container">
      <div className="chat-header">
        <h2>{selectedChat?.isGroupChat ? selectedChat.chatName : selectedChat?.users.find((u) => u._id !== JSON.parse(localStorage.getItem("user") || "{}")._id)?.name}</h2>
      </div>

      <div className="messages-section">
        {loading ? (
          <h4>Loading...</h4>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`message-item ${
                  message.sender._id === JSON.parse(localStorage.getItem("user") || "{}")._id
                    ? "outgoing"
                    : "incoming"
                }`}
              >
                <span className="message-sender font-bold">{message.sender.name}</span>
                <p className="message-content bg-gray-200 p-2 rounded-lg inline-block">{message.content}</p>
                <span className="message-timestamp text-gray-400 text-sm block mt-1">{new Date(message.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <form className="send-message-form flex mt-4" onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow border p-2 rounded-l-lg"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700">
          Send
        </button>
      </form>
    </div>
  );
};

export default SingleChat;