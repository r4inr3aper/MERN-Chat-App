import React, { useContext } from "react";
import { StoreContext } from "../context/StoreContext";
import SingleChat from "./SingleChat";

const ChatBox: React.FC<{ fetchAgain: boolean; setFetchAgain: (value: boolean) => void }> = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = useContext(StoreContext);

  return (
    <div className="chat-box-container">
      {selectedChat ? (
        <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      ) : (
        <h2 className="text-gray-500">Please select a chat to start messaging</h2>
      )}
    </div>
  );
};

export default ChatBox;
