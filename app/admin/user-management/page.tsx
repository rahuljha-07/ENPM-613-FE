"use client"; 

import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UserManagement() {
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('STUDENT'); // 'STUDENT' or 'INSTRUCTOR'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on active tab (role)
    const filtered = users.filter(user => user.role === activeTab);
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
        setUsers(result.body);
        // Initialize filtered users based on the default active tab
        const initialFiltered = result.body.filter(user => user.role === activeTab);
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-800 z-10">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Enlarged Title */}
        <h2 className="text-4xl font-bold mb-6 text-white">User Management</h2>

        {/* Tabs for User Roles */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('STUDENT')}
            className={`px-6 py-3 rounded-md font-semibold ${
              activeTab === 'STUDENT'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition duration-300`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab('INSTRUCTOR')}
            className={`px-6 py-3 rounded-md font-semibold ${
              activeTab === 'INSTRUCTOR'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition duration-300`}
          >
            Instructors
          </button>
        </div>

        {/* Loader */}
        {loading ? (
          <div className="flex items-center justify-center w-full h-64">
            <div className="loader border-t-4 border-white rounded-full w-16 h-16 animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col md:flex-row items-center justify-between border border-gray-300 p-6 rounded-lg shadow-sm bg-white text-gray-800"
                >
                  {/* Clickable Profile Section */}
                  <div
                    className="flex items-center space-x-4 cursor-pointer hover:underline"
                    onClick={() => window.location.href = `/admin/user-management/${user.id}`}
                  >
                    {/* Profile Image */}
                    <img
                      src={user.profileImageUrl || "/default-avatar.png"}
                      alt={`${user.name}'s profile`}
                      className="w-16 h-16 rounded-full border object-cover"
                    />

                    {/* Name and Email */}
                    <div>
                      <p className="text-xl font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4 mt-4 md:mt-0">
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 shadow-lg transform hover:scale-105"
                      onClick={() => handleBlockUser(user.id)}
                    >
                      Block
                    </button>
                    {/* Removed "View User" Button */}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center mt-20">
                <p className="text-2xl font-semibold text-gray-300">No users found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
