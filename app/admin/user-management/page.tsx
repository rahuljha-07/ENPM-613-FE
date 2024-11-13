// pages/admin/user.js
"use client";

import React, { useState } from 'react';

export default function GetUserDetails() {
  const [userDetails, setUserDetails] = useState(null);

  const fetchUserDetails = () => {
    // Replace with actual API call
    setUserDetails({
      name: "John Doe",
      email: "johndoe@example.com",
      role: "Instructor",
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center text-gray-800">
      <h2 className="text-4xl font-bold mb-6 text-blue-600 text-center">User Details</h2>
      <button onClick={fetchUserDetails} className="px-4 py-2 rounded-md bg-blue-500 text-white mb-4">
        Fetch User Details
      </button>
      {userDetails && (
        <div className="text-lg text-gray-700">
          <p><strong>Name:</strong> {userDetails.name}</p>
          <p><strong>Email:</strong> {userDetails.email}</p>
          <p><strong>Role:</strong> {userDetails.role}</p>
        </div>
      )}
    </div>
  );
}
