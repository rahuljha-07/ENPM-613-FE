"use client";

import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminPage() {
  const [inputValue, setInputValue] = useState('');

  // API Endpoints
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

  // Handle input change for text input
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Function to call API endpoints
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

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-2xl font-bold mb-4">Admin Actions</h2>

      {/* Reject Instructor Application */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Instructor Application ID"
          value={inputValue}
          onChange={handleInputChange}
          className="border p-2 mr-2 rounded"
        />
        <button
          onClick={() => apiCall(`/admin/reject-instructor-application`, 'POST', { instructorApplicationId: inputValue, message: "Rejection message" })}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Reject Instructor Application
        </button>
      </div>

      {/* Block User */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="User ID"
          value={inputValue}
          onChange={handleInputChange}
          className="border p-2 mr-2 rounded"
        />
        <button
          onClick={() => apiCall(`/admin/block-user/${inputValue}`, 'POST')}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Block User
        </button>
      </div>

      {/* Approve Instructor Application */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Instructor Application ID"
          value={inputValue}
          onChange={handleInputChange}
          className="border p-2 mr-2 rounded"
        />
        <button
          onClick={() => apiCall(`/admin/approve-instructor-application`, 'POST', { instructorApplicationId: inputValue, message: "Approval message" })}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Approve Instructor Application
        </button>
      </div>

      {/* Approve Course */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Course ID"
          value={inputValue}
          onChange={handleInputChange}
          className="border p-2 mr-2 rounded"
        />
        <button
          onClick={() => apiCall(`/admin/approve-course/${inputValue}`, 'POST')}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Approve Course
        </button>
      </div>

      {/* Get User Details */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="User ID"
          value={inputValue}
          onChange={handleInputChange}
          className="border p-2 mr-2 rounded"
        />
        <button
          onClick={() => apiCall(`/admin/user/${inputValue}`, 'GET')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Get User Details
        </button>
      </div>

      {/* Get All Users */}
      <div className="mb-4">
        <button
          onClick={() => apiCall(`/admin/user/all`, 'GET')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Get All Users
        </button>
      </div>

      {/* Get All Courses */}
      <div className="mb-4">
        <button
          onClick={() => apiCall(`/admin/course/all`, 'GET')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Get All Courses
        </button>
      </div>

      {/* Delete Course */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Course ID"
          value={inputValue}
          onChange={handleInputChange}
          className="border p-2 mr-2 rounded"
        />
        <button
          onClick={() => apiCall(`/admin/delete-course/${inputValue}`, 'DELETE')}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete Course
        </button>
      </div>
    </div>
  );
}
