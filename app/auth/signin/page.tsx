"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import 'react-toastify/dist/ReactToastify.css';

const SIGN_IN = `${process.env.NEXT_PUBLIC_ILIM_BE}/auth/sign-in`;
const USER_ENDPOINT = `${process.env.NEXT_PUBLIC_ILIM_BE}/user`;

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Function to store tokens in local storage
  const storeTokensInLocalStorage = async (data) => {
    try {
      localStorage.setItem('accessToken', data.accessToken);
    } catch (error) {
      console.error("Failed to store tokens in local storage:", error);
    }
  };

  // Function to retrieve and store user role in local storage
  const fetchAndStoreUserRole = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(USER_ENDPOINT, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const userData = await response.json();
  
        // Extract birthdate and format it to "mm-dd-yyyy"
        const birthdateArray = userData.body.birthdate; // Expected format: [yyyy, mm, dd]
        let formattedBirthdate = '';
        if (birthdateArray && birthdateArray.length === 3) {
          const [year, month, day] = birthdateArray;
          formattedBirthdate = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}-${year}`;
        }
  
        // Store user data in local storage
        localStorage.setItem('name', userData.body.name);
        localStorage.setItem('email', userData.body.email);
        localStorage.setItem('birthdate', formattedBirthdate); // Store formatted birthdate
        localStorage.setItem('role', userData.body.role);
      } else {
        console.error("Failed to fetch user role:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(SIGN_IN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store tokens in local storage
        await storeTokensInLocalStorage(data);
        await fetchAndStoreUserRole();

        toast.success('Sign-in successful!');
        console.log('Sign-in successful:', data);

        // Redirect to the dashboard or another page upon successful sign-in
        router.push('/course-details');
      } else {
        const errorData = await response.json();
        const errMsg= errorData.body.split('.')[0];
        toast.error(errMsg || 'Sign-in failed');
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      toast.error('An error occurred during sign-in. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <EyeIcon className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <a href="/auth/forgot-password" className="text-blue-500 hover:underline text-sm">
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600 mt-4">
          Don’t have an account?{' '}
          <a href="/auth/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
