"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UserManagement() {
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(lowercasedSearchTerm) ||
      user.email.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

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
        setFilteredUsers(result.body); // Initialize filtered users
      } else {
        toast.error(`Error: ${result.message || 'Failed to load users'}`);
      }
    } catch (error) {
      toast.error('Failed to connect to the API');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

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
    <div className="flex h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Sidebar */}
      <div className="fixed h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 pl-20 lg:pl-56 ml-16 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">User Management</h2>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        />

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
                  className="flex items-center justify-between border border-gray-300 p-4 rounded-lg shadow-sm bg-white"
                >
                  <div className="flex items-center space-x-4">
                    {/* Profile Image */}
                    <img
                      src={user.profileImageUrl || "/default-avatar.png"}
                      alt={`${user.name}'s profile`}
                      className="w-12 h-12 rounded-full border"
                    />

                    {/* Name and Email */}
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleBlockUser(user.id)}
                    >
                      Block
                    </button>
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => window.location.href = `/admin/user-management/${user.id}`}
                    >
                      View User
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No users found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
