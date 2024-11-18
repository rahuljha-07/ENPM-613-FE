"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DEFAULT_PROFILE_IMAGE = "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

export default function UserManagement() {
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('STUDENT');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on active tab (role) and exclude blocked users
    const filtered = users.filter(user => user.role === activeTab && !user.blocked);
    setFilteredUsers(filtered);
  }, [activeTab, users]);

  const getAccessToken = () => localStorage.getItem('accessToken');

  const fetchUsers = useCallback(async () => {
    const token = getAccessToken();
    if (!BASE_URL || !token) {
      console.error("BASE_URL or token is not defined");
      toast.error("Failed to load users. Please check your credentials.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/admin/user/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (response.ok) {
        const unblockedUsers = result.body.filter(user => !user.blocked);
        setUsers(unblockedUsers);

        // Initialize filtered users based on the default active tab
        const initialFiltered = unblockedUsers.filter(user => user.role === activeTab);
        setFilteredUsers(initialFiltered);
      } else {
        toast.error(`Error: ${result.message || 'Failed to load users'}`);
      }
    } catch (error) {
      toast.error('Failed to connect to the API');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, activeTab]);

  const handleBlockUser = async (userId) => {
    const token = getAccessToken();
    const endpoint = `${BASE_URL}/admin/block-user/${userId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success(`User blocked successfully!`);
        fetchUsers(); // Refresh users list after action
      } else {
        const result = await response.json();
        toast.error(`Error: ${result.message || 'Something went wrong'}`);
      }
    } catch (error) {
      toast.error('Failed to connect to the API');
      console.error(error);
    }
  };

  const handleTileClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="flex h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Sidebar */}
      <div className="fixed h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 pl-20 lg:pl-56 ml-16 overflow-y-auto bg-white">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">User Management</h2>

        {/* Tabs for User Roles */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('STUDENT')}
            className={`px-6 py-2 font-semibold rounded-lg shadow-md transition duration-300 ${
              activeTab === 'STUDENT'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab('INSTRUCTOR')}
            className={`px-6 py-2 font-semibold rounded-lg shadow-md transition duration-300 ${
              activeTab === 'INSTRUCTOR'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Instructors
          </button>
        </div>

        {/* Loader */}
        {loading ? (
          <div className="flex items-center justify-center w-full h-64">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between border border-gray-300 p-4 rounded-lg shadow-sm bg-white text-gray-800 cursor-pointer"
                  onClick={() => handleTileClick(user)}
                >
                  {/* Profile Section */}
                  <div className="flex items-center space-x-4">
                    <img
                      src={user.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                      alt={`${user.name}'s profile`}
                      className="w-16 h-16 rounded-full border object-cover"
                    />

                    <div>
                      <p className="text-lg font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  {/* Block User Button */}
                  <div>
                    <button
                      className="px-4 py-2 font-semibold text-white bg-red-500 hover:bg-red-600 rounded-full shadow-lg transition transform duration-300 hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent modal from opening when clicking block
                        handleBlockUser(user.id);
                      }}
                    >
                      Block
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No users found.</p>
            )}
          </div>
        )}

        {/* Modal for User Details */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-black overflow-y-auto max-h-[80vh]">
              <h3 className="text-2xl font-semibold mb-4">User Details</h3>
              <img
                src={selectedUser.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-4 shadow-md"
              />
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Birthdate:</strong> {selectedUser.birthdate}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Title:</strong> {selectedUser.title}</p>
              <p><strong>Bio:</strong> {selectedUser.bio}</p>

              <div className="flex justify-end mt-6">
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
