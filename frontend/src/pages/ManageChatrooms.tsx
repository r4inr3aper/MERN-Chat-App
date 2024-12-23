import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GroupInfo from "../components/GroupInfo";
import Navbar from "../components/Navbar";

interface Chat {
  _id: string;
  chatName: string;
  users: { _id: string; name: string; email: string }[];
  isGroupChat: boolean;
}

const ManageChatrooms = () => {
  const { token, url, groups, setGroups } = useContext(StoreContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const groupsPerPage = 6; 

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<Chat[]>(`${url}/api/chat/all`, {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setGroups(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching groups:", error);
      toast.error("Failed to load chat groups.");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((group) =>
    group.chatName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGroups.length / groupsPerPage);
  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = filteredGroups.slice(indexOfFirstGroup, indexOfLastGroup);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <div className="text-white text-center">Loading groups...</div>;
  }

  return (
    <div className="p-8 w-full bg-[#25262d] h-screen overflow-y-auto">
      <Navbar />
      <h2 className="text-2xl font-bold text-white mb-4">Manage Chatrooms</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search Chatrooms"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 w-full rounded bg-[#1c1d22] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6 w-full">
        {currentGroups.map((group) => (
          <div
            key={group._id}
            className="bg-[#1c1d22] p-6 rounded-lg shadow-md flex flex-col items-center"
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              {group.chatName}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Members: {group.users.length}
            </p>
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
              onClick={() => setSelectedGroup(group)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <button
          className="px-4 py-2 mx-2 bg-gray-600 text-white rounded disabled:opacity-50"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`px-4 py-2 mx-1 rounded ${
              currentPage === index + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-600 text-white"
            }`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="px-4 py-2 mx-2 bg-gray-600 text-white rounded disabled:opacity-50"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {selectedGroup && (
        <GroupInfo
          setFetchAgain={fetchGroups}
          fetchAgain={loading}
          setInfo={() => setSelectedGroup(null)}
          info={true}
          setSearch={() => {}}
          search={searchQuery}
          selectedChat={selectedGroup}
        />
      )}
    </div>
  );
};

export default ManageChatrooms;
