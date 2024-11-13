"use client";

import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Link from 'next/link';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

  const apiCall = async (url, body = null) => {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
      });
      const result = await response.json();
      if (response.ok) {
        toast.success('Action successful!');
        console.log(result);
      } else {
        toast.error(`Error: ${result.message || 'Something went wrong'}`);
      }
    } catch (error) {
      toast.error('Failed to connect to the API');
      console.error(error);
    }
  };

  const actions = [
    {
      label: 'Reject Instructor Application',
      color: 'bg-red-500',
      url: '/admin/reject-instructor-application',
      body: { message: "Rejection message" },
    },
    {
      label: 'Block User',
      color: 'bg-red-500',
      url: '/admin/block-user',
    },
    {
      label: 'Approve Instructor Application',
      color: 'bg-green-500',
      url: '/admin/approve-instructor-application',
      body: { message: "Approval message" },
    },
    {
      label: 'Approve Course',
      color: 'bg-green-500',
      url: '/admin/approve-courses',
    },
    {
      label: 'Get User Details',
      color: 'bg-blue-500',
      url: '/admin/get-use-details',
    },
    {
      label: 'Get All Users',
      color: 'bg-blue-500',
      url: '/admin/get-all-user',
    },
    {
      label: 'Get All Courses',
      color: 'bg-blue-500',
      url: '/admin/get-all-courses',
    },
    {
      label: 'Delete Course',
      color: 'bg-red-500',
      url: '/admin/delete-course',
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center text-gray-800">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-5xl font-bold mb-6 text-purple-600 text-center">Admin Dashboard</h2>
      <p className="text-lg text-gray-600 mb-8 text-center">Manage and perform actions on courses and users</p>

      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <div key={index} className="bg-white p-5 rounded-lg shadow-md transition-transform transform hover:scale-105">
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 text-center">{action.label}</h3>
              <Link href={action.url}>
                <button
                  onClick={() => apiCall(action.url, action.body)}
                  className={`px-4 py-2 rounded-md text-white ${action.color}`}
                >
                  Execute
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
