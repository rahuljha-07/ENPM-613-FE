"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    bio: "Web Developer, Designer, and Tech Enthusiast.",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Profile</h1>

        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <img
            src="https://via.placeholder.com/100" // Placeholder image
            alt="Profile"
            className="w-24 h-24 rounded-full border-2 border-gray-300"
          />
        </div>

        {/* Profile Details */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-semibold">Name</label>
            {editing ? (
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-700">{userData.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold">Email</label>
            {editing ? (
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-700">{userData.email}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-gray-700 font-semibold">Bio</label>
            {editing ? (
              <textarea
                name="bio"
                value={userData.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              ></textarea>
            ) : (
              <p className="text-gray-700">{userData.bio}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={handleEditToggle}
            className={`px-4 py-2 rounded-lg ${
              editing ? "bg-green-500 text-white" : "bg-blue-500 text-white"
            } transition duration-200 hover:bg-opacity-80`}
          >
            {editing ? "Save Changes" : "Edit Profile"}
          </button>
          {editing && (
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg bg-gray-400 text-white transition duration-200 hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
