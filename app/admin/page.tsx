"use client";

import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminPage() {
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState('');
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = (action) => {
    setInputType(action);
    setInputValue(''); // Reset input field for a new action
  };

  const apiCall = async (url, method, body = null) => {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        method,
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
    { label: 'Reject Instructor Application', color: 'bg-red-500', url: '/admin/reject-instructor-application', method: 'POST', body: { instructorApplicationId: inputValue, message: "Rejection message" } },
    { label: 'Block User', color: 'bg-red-500', url: `/admin/block-user/${inputValue}`, method: 'POST' },
    { label: 'Approve Instructor Application', color: 'bg-green-500', url: '/admin/approve-instructor-application', method: 'POST', body: { instructorApplicationId: inputValue, message: "Approval message" } },
    { label: 'Approve Course', color: 'bg-green-500', url: `/admin/approve-course/${inputValue}`, method: 'POST' },
    { label: 'Get User Details', color: 'bg-blue-500', url: `/admin/user/${inputValue}`, method: 'GET' },
    { label: 'Get All Users', color: 'bg-blue-500', url: '/admin/user/all', method: 'GET' },
    { label: 'Get All Courses', color: 'bg-blue-500', url: '/admin/course/all', method: 'GET' },
    { label: 'Delete Course', color: 'bg-red-500', url: `/admin/delete-course/${inputValue}`, method: 'DELETE' },
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center text-gray-800">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-4xl font-bold mb-8 text-gray-700">Admin Dashboard</h2>

      <div className="w-full max-w-3xl space-y-6">
        {/* Action Buttons */}
        {actions.map((action, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">{action.label}</h3>
              <p className="text-sm text-gray-500">Action: {action.method}</p>
            </div>
            <button
              onClick={() => {
                handleButtonClick(action.label);
                apiCall(action.url, action.method, action.body);
              }}
              className={`px-4 py-2 rounded-lg text-white ${action.color}`}
            >
              Execute
            </button>
          </div>
        ))}

        {/* Input Field */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Input for Selected Action:</h3>
          <input
            type="text"
            placeholder={inputType}
            value={inputValue}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg text-gray-700 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
