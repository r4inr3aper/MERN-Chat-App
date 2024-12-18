import { useContext } from "react";
import { StoreContext } from "../context/StoreContext";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const { logout, isSidebarOpen, setIsSidebarOpen } = useContext(StoreContext);

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      <div className="flex w-full justify-between p-5">
        <h2
          className="cursor-pointer text-blue-500 font-semibold"
          onClick={toggleSidebar}
        >
          Search
        </h2>
        <h2 className="text-xl font-bold">Chat App</h2>
        <button
          className="cursor-pointer p-2 bg-red-600 text-white rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

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
