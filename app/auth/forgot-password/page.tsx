"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FORGOT_PASSWORD_URL = `${process.env.NEXT_PUBLIC_ILIM_BE}/auth/forgot-password`;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(FORGOT_PASSWORD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }), // Ensure email is sent as JSON
      });

      if (response.ok) {
        toast.success('Password reset confirmation code sent to your email!');
        setEmail(''); // Clear the email input after successful request
        // Redirect to the reset-password page
        router.push('/auth/reset-password');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
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

        {/* Form Container */}
        <div className="w-full max-w-md bg-white text-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
          <p className="text-center text-gray-600 mb-4">
            Enter your email to receive a password reset link.
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                  !email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              } text-white py-2 rounded-lg transition-colors font-semibold flex items-center justify-center`}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset OTP'}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-gray-600 mt-4">
            <a href="/auth/signin" className="text-blue-500 hover:underline">
              Back to Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
