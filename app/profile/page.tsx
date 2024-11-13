"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToastContainer, toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    birthdate: "",
    role: "",
    profileImageUrl: "",
    title: "",
    bio: "",
    blocked: false,
  });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data.body);
        toast.success("Profile loaded successfully!");
      } else {
        throw new Error("Failed to load profile data.");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data.");
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${BASE_URL}/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profileImageUrl: profileData.profileImageUrl,
          title: profileData.title,
          bio: profileData.bio,
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setEditing(false);
        fetchUserProfile();
      } else {
        throw new Error("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  const handleChangePassword = async () => {
    const token = localStorage.getItem("accessToken");
    if (!oldPassword || !newPassword) {
      toast.error("Please provide both old and new passwords.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
      } else {
        throw new Error("Failed to change password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password.");
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <Sidebar />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <div className="flex-1 flex flex-col items-center p-10">
        <div className="flex flex-col bg-white text-gray-800 rounded-lg shadow-lg p-8 w-full max-w-4xl">
          
          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <img
              src={profileData.profileImageUrl || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-32 h-32 rounded-full shadow-md"
            />
          </div>

          {/* Profile Info Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Name and Role on the left */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                Name
              </label>
              <Input
                type="text"
                id="name"
                value={profileData.name}
                className="mt-1 w-full"
                disabled
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700">
                Role
              </label>
              <Input
                type="text"
                id="role"
                value={profileData.role}
                className="mt-1 w-full"
                disabled
              />
            </div>

            {/* Birthdate and Email on the right */}
            <div>
              <label htmlFor="birthdate" className="block text-sm font-semibold text-gray-700">
                Birthdate
              </label>
              <Input
                type="text"
                id="birthdate"
                value={profileData.birthdate}
                className="mt-1 w-full"
                disabled
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email
              </label>
              <Input
                type="email"
                id="email"
                value={profileData.email}
                className="mt-1 w-full"
                disabled
              />
            </div>
          </div>

          {/* Title and Bio spanning full width */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
              Title
            </label>
            <Input
              type="text"
              id="title"
              value={profileData.title}
              onChange={handleInputChange}
              className="mt-1 w-full"
              disabled={!editing}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="bio" className="block text-sm font-semibold text-gray-700">
              Bio
            </label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              className="mt-1 w-full"
              disabled={!editing}
            />
          </div>

          {/* Action Buttons for Profile Update */}
          {editing ? (
            <div className="flex space-x-4">
              <Button onClick={() => setEditing(false)} className="bg-gray-500 hover:bg-gray-600 text-white w-full">
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} className="bg-green-500 hover:bg-green-600 text-white w-full">
                Save
              </Button>
            </div>
          ) : (
            <Button onClick={() => setEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white w-full">
              Edit Profile
            </Button>
          )}

          {/* Change Password Section */}
          <div className="space-y-4 mt-10">
            <h2 className="text-xl font-semibold text-gray-700">Change Password</h2>
            
            {/* Old Password Field */}
            <div className="relative">
              <Input
                type={showOldPassword ? "text" : "password"}
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="mt-1 w-full"
              />
              <span
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
              >
                {showOldPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </span>
            </div>

            {/* New Password Field */}
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full"
              />
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
              >
                {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </span>
            </div>
            
            <Button onClick={handleChangePassword} className="bg-red-500 hover:bg-red-600 text-white w-full mt-2">
              Change Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
