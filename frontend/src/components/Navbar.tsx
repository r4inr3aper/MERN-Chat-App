import { useContext, useState } from "react";
import { StoreContext } from "../context/StoreContext";
import { useNavigate } from "react-router-dom";
import GroupChatBox from "../components/GroupChatCreate";
import Sidebar from "../components/Sidebar";

const Navbar = () => {
  const { isSidebarOpen, setIsSidebarOpen, logout, isAdmin } = useContext(StoreContext);
  const [isGroupChatBoxVisible, setIsGroupChatBoxVisible] = useState(false);

  const navigate = useNavigate();

  const handleNewGroupChat = () => {
    setIsGroupChatBoxVisible(true);
  };

  const closeGroupChatBox = () => {
    setIsGroupChatBoxVisible(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const handleManageChatrooms = () => {
    navigate("/manage");
  };

  const handleHome = () => {
    navigate("/"); 
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-[#25262d] py-4 px-14 flex justify-between items-center z-50">
      <div
        className="text-white text-xl font-bold cursor-pointer"
        onClick={handleHome} 
      >
        Discord
      </div>
      <div className="flex items-center">
        <button
          className="cursor-pointer px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-4"
        >
          Profile
        </button>

        {isAdmin && (
          <>
            <button
              className="cursor-pointer px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-4"
              onClick={handleManageChatrooms}
            >
              Manage Chatrooms
            </button>
            <button
              className="cursor-pointer px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-4"
              onClick={handleNewGroupChat}
            >
              New Group Chat
            </button>
          </>
        )}

        <button
          className="cursor-pointer p-2 bg-red-600 text-white rounded"
          onClick={handleLogout}
        >
          Logout
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

      {isSidebarOpen && (
        <div className="fixed inset-0 z-10 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={toggleSidebar}
          ></div>
          <div className="relative z-20">
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
