// pages/admin/approve-course.js
"use client";

import React from 'react';
import { toast } from 'react-toastify';

export default function ApproveCourse() {
  const handleApproveCourse = () => {
    toast.success("Course approved successfully!");
    // Add API call logic here if needed
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center text-gray-800">
      <h2 className="text-4xl font-bold mb-6 text-green-600 text-center">Approve Course</h2>
      <p className="text-lg text-gray-600 mb-8 text-center">Confirm approval of the course.</p>
      <button
        onClick={handleApproveCourse}
        className="px-4 py-2 rounded-md bg-green-500 text-white"
      >
        Approve Course
      </button>
    </div>
  );
}
