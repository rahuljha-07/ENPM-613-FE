"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';

export default function UserDetails() {
  const { userId } = useParams();
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    const token = localStorage.getItem('accessToken');
    if (!BASE_URL || !token || !userId) {
      console.error("BASE_URL, token, or userId is not defined");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/admin/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok) {
        setUserData(result.body);
      } else {
        console.error('Failed to load user data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          {/* Loader */}
          <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="fixed h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 pl-20 lg:pl-56 ml-16 overflow-y-auto">
        <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
          {/* Personal Info */}
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={userData.profileImageUrl || "/default-avatar.png"}
              alt={`${userData.name}'s profile`}
              className="w-16 h-16 rounded-full border"
            />
            <div>
              <h2 className="text-lg font-semibold">{userData.name}</h2>
              <p>{userData.email}</p>
              <p>{new Date(userData.birthdate).toLocaleDateString()} ({calculateAge(userData.birthdate)} years old)</p>
              <p>{userData.role === "STUDENT" ? "Student" : userData.role}</p>
            </div>
          </div>

          {/* Educational Background */}
          <div className="mb-4">
            <h3 className="text-md font-semibold">Educational Background</h3>
            <p className="text-sm text-gray-600">Degree from School - Graduation Date</p>
          </div>

          {/* Professional Background */}
          <div className="mb-4">
            <h3 className="text-md font-semibold">Professional Background</h3>
            <p className="text-sm text-gray-600"># years as a Job Title</p>
            <button className="text-blue-500 text-sm hover:underline">📄 Resume</button>
          </div>

          {/* Teaching */}
          <div className="mb-4">
            <h3 className="text-md font-semibold">Teaching</h3>
            <p className="text-sm text-gray-600">{userData.title || "Instructor Title"}</p>
            <p className="text-sm text-gray-600">{userData.bio}</p>
          </div>

          {/* Instructor Bio */}
          <div className="mb-4">
            <h3 className="text-md font-semibold">Instructor Bio</h3>
            <p className="text-sm text-gray-600">{userData.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate age from birthdate
function calculateAge(birthdate) {
  const birthDate = new Date(birthdate);
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
