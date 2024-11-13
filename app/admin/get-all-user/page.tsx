// pages/admin/get-all-users.js
"use client";

import React, { useState } from 'react';

export default function GetAllUsers() {
  const [users, setUsers] = useState([]);

  const fetchAllUsers = () => {
    // Replace with actual API call logic
    setUsers([
      { id: 1, name: "John Doe", email: "johndoe@example.com" },
      { id: 2, name: "Jane Smith", email: "janesmith@example.com" },
    ]);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center text-gray-800">
      <h2 className="text-4xl font-bold mb-6 text-blue-600 text-center">All Users</h2>
      <button onClick={fetchAllUsers} className="px-4 py-2 rounded-md bg-blue-500 text-white mb-4">
        Fetch All Users
      </button>
      <div className="mt-4 w-full max-w-md">
        {users.map(user => (
          <div key={user.id} className="p-4 mb-2 bg-white rounded shadow text-gray-800">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
