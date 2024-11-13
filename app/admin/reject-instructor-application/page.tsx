"use client";

import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RejectInstructorApplication() {
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

  const handleRejectApplication = async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/reject-instructor-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: "Rejection message" }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success('Instructor application rejected successfully!');
      } else {
        toast.error(`Error: ${result.message || 'Something went wrong'}`);
      }
    } catch (error) {
      toast.error('Failed to connect to the API');
      console.error(error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center text-gray-800">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-3xl font-bold mb-4 text-red-500">Reject Instructor Application</h2>
      <p className="text-lg text-gray-600 mb-6 text-center">This page allows you to reject an instructor application.</p>
      <button
        // onClick={handleRejectApplication}
        className="px-6 py-2 rounded-md text-white bg-red-500 hover:bg-red-600"
      >
        Reject Application
      </button>
    </div>
  );
}
