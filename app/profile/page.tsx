"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToastContainer, toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon, CameraIcon, DownloadIcon } from "@heroicons/react/24/solid";
import "react-toastify/dist/ReactToastify.css";
import { uploadFileToS3 } from "../../lib/s3"; // Import the S3 upload function

const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

export default function ProfilePage() {
  // Retrieve user role from localStorage
  const userRole = localStorage.getItem("role");

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
  const [retypePassword, setRetypePassword] = useState(""); // New retype password state
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false); // Show/hide retype password
  const [editing, setEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false); // New state for collapsible section

  // New state to store selected profile image file
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // State to handle save button loading

  // State for Instructor Data
  const [instructorData, setInstructorData] = useState(null);

  // Ref for the hidden file input
  const hiddenFileInput = useRef(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Conditional GET request for INSTRUCTOR role
    if (userRole === "INSTRUCTOR") {
      fetchInstructorApplication();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  /**
   * Fetch user profile data from the backend.
   */
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
      } else {
        throw new Error("Failed to load profile data.");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data.");
    }
  };

  /**
   * Fetch instructor application data if user is an INSTRUCTOR.
   */
  const fetchInstructorApplication = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Access token not found. Please log in.");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/student/instructor-application?status=APPROVED`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.body && data.body.length > 0) {
          setInstructorData(data.body[0]); // Assuming only one application per user
          console.log("Instructor Application Response:", data);
        } else {
          console.log("No instructor application found.");
        }
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch instructor application."
        );
      }
    } catch (error) {
      console.error("Error fetching instructor application:", error);
    }
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedProfileImage(file);
      // Optionally, preview the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prevData) => ({
          ...prevData,
          profileImageUrl: reader.result, // Temporary preview
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("accessToken");
    setIsSaving(true);

    try {
      let imageUrl = profileData.profileImageUrl;

      // If a new profile image is selected, upload it to S3
      if (selectedProfileImage) {
        const userId = localStorage.getItem("id");
        const fileName = `${userId}-profile-${Date.now()}-${selectedProfileImage.name}`;

        imageUrl = await uploadFileToS3(selectedProfileImage, fileName); // Upload to S3
      }

      // Prepare the payload
      const payload = {
        profileImageUrl: imageUrl,
        title: profileData.title,
        bio: profileData.bio,
      };

      // Send the PUT request to update the profile
      const response = await fetch(`${BASE_URL}/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setEditing(false);
        setSelectedProfileImage(null); // Reset the selected image
        fetchUserProfile();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to update profile.";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const token = localStorage.getItem("accessToken");

    if (newPassword !== retypePassword) {
      toast.error("New password and retype password do not match.");
      return;
    }

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
        setRetypePassword(""); // Clear retype password
        setIsChangePasswordOpen(false); // Close the collapsible section
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to change password.";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password.");
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      {/* Fixed Sidebar */}
      <Sidebar className="fixed top-0 left-0 h-full w-64 z-50" />

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center p-4 ml-64">
        <div className="flex flex-col bg-white text-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
          {/* Profile Image */}
          <div className="flex justify-center mb-4">
            <img
              src={profileData.profileImageUrl || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-24 h-24 rounded-full shadow-md object-cover"
            />
          </div>

          {/* Upload Profile Picture - Only Visible When Editing */}
          {editing && (
            <div className="flex justify-center mb-4">
              <button
                onClick={handleClick}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                <CameraIcon className="h-5 w-5 mr-2" />
                Choose Profile Picture
              </button>
              <input
                type="file"
                accept="image/*"
                ref={hiddenFileInput}
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>
          )}

          {/* Profile Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <label htmlFor="name" className="block font-semibold text-gray-700">
                Name
              </label>
              <Input
                type="text"
                id="name"
                value={profileData.name}
                className="mt-1 w-full p-2 text-sm"
                disabled
              />
            </div>

            <div>
              <label htmlFor="role" className="block font-semibold text-gray-700">
                Role
              </label>
              <Input
                type="text"
                id="role"
                value={profileData.role}
                className="mt-1 w-full p-2 text-sm"
                disabled
              />
            </div>

            <div>
              <label htmlFor="birthdate" className="block font-semibold text-gray-700">
                Birthdate
              </label>
              <Input
                type="text"
                id="birthdate"
                value={profileData.birthdate}
                className="mt-1 w-full p-2 text-sm"
                disabled
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-semibold text-gray-700">
                Email
              </label>
              <Input
                type="email"
                id="email"
                value={profileData.email}
                className="mt-1 w-full p-2 text-sm"
                disabled
              />
            </div>
          </div>

          {/* Title Field */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
              Title
            </label>
            <Input
              type="text"
              id="title"
              value={profileData.title}
              onChange={handleInputChange}
              className="mt-1 w-full p-2 text-sm"
              disabled={!editing}
            />
          </div>

          {/* Bio Field */}
          <div className="mb-4">
            <label htmlFor="bio" className="block text-sm font-semibold text-gray-700">
              Bio
            </label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              className="mt-1 w-full p-2 text-sm"
              disabled={!editing}
            />
          </div>

          {/* Instructor Details - Visible Only for Instructors */}
          {userRole === "INSTRUCTOR" && instructorData && (
            <div className="mt-6 bg-gray-100 text-gray-800 p-6 rounded-lg shadow-md w-full">
              <h2 className="text-xl font-semibold mb-4">Instructor Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">School Name:</p>
                  <p>{instructorData.schoolName || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold">Degree Title:</p>
                  <p>{instructorData.degreeTitle || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold">Graduate Date:</p>
                  <p>{instructorData.graduateDate || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold">Professional Title:</p>
                  <p>{instructorData.professionalTitle || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold">Experience Years:</p>
                  <p>{instructorData.experienceYears !== null ? instructorData.experienceYears : "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold">Resume:</p>
                  <p>
                    {instructorData.resumeUrl ? (
                      <a
                        href={instructorData.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:underline"
                        download
                      >
                        <DownloadIcon className="h-5 w-5 mr-1" />
                        Download Resume
                      </a>
                    ) : (
                      "No resume uploaded"
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="font-semibold">Teaching Experience:</p>
                  <p>{instructorData.teachingExperience || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-semibold">Instructor Title:</p>
                  <p>{instructorData.instructorTitle || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-semibold">Instructor Bio:</p>
                  <p>{instructorData.instructorBio || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Edit/Save Buttons */}
          {editing ? (
            <div className="flex space-x-4 mt-6 w-full">
              <Button onClick={() => setEditing(false)} className="bg-gray-500 hover:bg-gray-600 text-white w-full">
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="bg-green-500 hover:bg-green-600 text-white w-full"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white w-full mt-6">
              Edit Profile
            </Button>
          )}

          {/* Change Password Section */}
          <div className="space-y-4 mt-6 w-full">
            {/* Toggle Button for Change Password */}
            <button
              onClick={() => setIsChangePasswordOpen(!isChangePasswordOpen)}
              className="flex items-center justify-between w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-300"
            >
              <span className="font-semibold">Change Password</span>
              {/* Arrow Icon indicating collapsible state */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transform transition-transform duration-300 ${
                  isChangePasswordOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Collapsible Change Password Form */}
            {isChangePasswordOpen && (
              <div className="space-y-4 mt-2">
                {/* Old Password Field */}
                <div className="relative">
                  <Input
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="mt-1 w-full p-2 text-sm"
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
                    className="mt-1 w-full p-2 text-sm"
                  />
                  <span
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  >
                    {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </span>
                </div>

                {/* Retype New Password Field */}
                <div className="relative">
                  <Input
                    type={showRetypePassword ? "text" : "password"}
                    placeholder="Retype New Password"
                    value={retypePassword}
                    onChange={(e) => setRetypePassword(e.target.value)}
                    className="mt-1 w-full p-2 text-sm"
                  />
                  <span
                    onClick={() => setShowRetypePassword(!showRetypePassword)}
                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  >
                    {showRetypePassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </span>
                </div>

                <Button onClick={handleChangePassword} className="bg-red-500 hover:bg-red-600 text-white w-full">
                  Change Password
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
