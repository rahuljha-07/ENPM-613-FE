"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    bio: "Passionate learner and software developer with a love for technology and innovation.",
  });

  const [editing, setEditing] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSave = () => {
    setEditing(false);
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      <div className="bg-white text-gray-800 rounded-lg shadow-lg p-8 w-full max-w-lg space-y-6">
        <h1 className="text-3xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
          Profile
        </h1>
        
        <div className="text-center mb-6">
          <img
            src="https://via.placeholder.com/100"
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto shadow-md mb-4"
          />
          <p className="text-gray-600 text-sm">Welcome back, {profileData.name}</p>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
              Name
            </label>
            {editing ? (
              <Input
                type="text"
                id="name"
                value={profileData.name}
                onChange={handleInputChange}
                className="mt-1 w-full"
              />
            ) : (
              <p className="mt-1 text-gray-800">{profileData.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            {editing ? (
              <Input
                type="email"
                id="email"
                value={profileData.email}
                onChange={handleInputChange}
                className="mt-1 w-full"
              />
            ) : (
              <p className="mt-1 text-gray-800">{profileData.email}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-semibold text-gray-700">
              Bio
            </label>
            {editing ? (
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                className="mt-1 w-full"
              />
            ) : (
              <p className="mt-1 text-gray-800">{profileData.bio}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)} className="bg-gray-500 hover:bg-gray-600 text-white">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white">
                Save
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white w-full">
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
