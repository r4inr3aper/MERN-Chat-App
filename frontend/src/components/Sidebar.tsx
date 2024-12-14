import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirect

const Sidebar = () => {
  const { url, token, logout } = useContext(StoreContext); // Get the URL, token, and logout function from the context
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]); // Store the search results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>(''); // State to hold error message
  const navigate = useNavigate(); // To redirect after logout

  // Function to handle the search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Function to fetch users based on the search query
  const fetchUsers = async () => {
    if (!searchQuery) {
      setSearchResults([]); // Clear results if search query is empty
      return;
    }

    setLoading(true);
    setError(''); // Reset error state before making the request
    try {
      const response = await axios.get(`${url}/api/user/all?search=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data); // Set the search results
    } catch (error: any) {
      setError('Failed to fetch users. Please try again later.'); // Set error message
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch users when the search query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500); // Add debounce for better performance

    return () => clearTimeout(delayDebounceFn); // Cleanup the debounce
  }, [searchQuery]);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await axios.post(`${url}/api/user/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout(); // Clear token from context
      localStorage.removeItem('token'); // Clear token from localStorage
      navigate('/'); // Redirect to home or login page
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="w-64 bg-gray-100 p-4 h-full shadow-md">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error Message */}
      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* Loading Indicator */}
      {loading && <div className="text-gray-500 text-sm">Loading...</div>}

      {/* Search Results */}
      <div className="mt-4">
        {searchResults.length > 0 ? (
          searchResults.map((user: any) => (
            <div key={user._id} className="p-2 mb-2 bg-white rounded-md shadow-sm hover:bg-gray-200 cursor-pointer">
              <p className="text-gray-800">{user.name}</p>
            </div>
          ))
        ) : (
          !loading && <div className="text-gray-500 text-sm">No users found</div>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-4 w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
