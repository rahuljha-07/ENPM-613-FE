"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VERIFY_ACCOUNT_URL = `${process.env.NEXT_PUBLIC_ILIM_BE}/auth/verify-account`;

export default function Verification() {
  const [verificationCode, setVerificationCode] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');  // Retrieve email from URL parameters

  useEffect(() => {
    if (!email) {
      toast.error("Email is missing. Please go back to the sign-up page.");
      router.push('/auth/signin');
    }
  }, [email, router]);

  // Handle input change
  const handleChange = (e) => {
    setVerificationCode(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(VERIFY_ACCOUNT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, confirmationCode: verificationCode }), // Include email and confirmationCode
      });

      if (response.ok) {
        toast.success('Verification successful!');
        router.push('/signin');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      toast.error('An error occurred during verification. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Enter Verification Code</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="verificationCode" className="block text-gray-700">
              Verification Code
            </label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter the code sent to your email"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
