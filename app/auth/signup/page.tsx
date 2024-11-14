"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'; // Ensure Heroicons v2 is installed
import 'react-toastify/dist/ReactToastify.css';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    birthdate: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Add isSubmitting state
  const router = useRouter();
  
  // Backend API URL with the signup endpoint
  const SIGN_UP_URL = `${process.env.NEXT_PUBLIC_ILIM_BE}/auth/sign-up`;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.birthdate) newErrors.birthdate = 'Birthdate is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true); // Set isSubmitting to true
      try {
        const response = await fetch(SIGN_UP_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          toast.success('Sign-up successful!');
          setFormData({
            name: '',
            birthdate: '',
            email: '',
            password: '',
          });
          router.push(`/auth/verification?email=${encodeURIComponent(formData.email)}`);
        } else {
          const errorData = await response.json();
          toast.error(`Sign-up failed: ${errorData.body}`);
        }
      } catch (error) {
        console.error('Error during sign-up:', error);
        toast.error('An error occurred during sign-up. Please try again.');
      } finally {
        setIsSubmitting(false); // Reset isSubmitting to false after the request
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        {/* Form Container */}
        <div className="w-full max-w-md bg-white text-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your name"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Birthdate Field */}
            <div>
              <label htmlFor="birthdate" className="block text-gray-700 font-semibold mb-2">
                Birthdate <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.birthdate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>}
            </div>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.birthdate || !formData.email || !formData.password}
              title={
                !formData.name || !formData.birthdate || !formData.email || !formData.password
                  ? 'Please fill in all required fields'
                  : ''
              }
              className={`${
                !formData.name || !formData.birthdate || !formData.email || !formData.password
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-6 py-2 rounded-lg w-full transition-colors font-semibold flex items-center justify-center`}
            >
              {isSubmitting ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <a href="/auth/signin" className="text-blue-500 hover:underline">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
