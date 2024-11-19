"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
const VERIFY_ACCOUNT_URL = `${process.env.NEXT_PUBLIC_ILIM_BE}/auth/verify-account`;

function VerificationContent() {
  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // Retrieve email from URL parameters

  useEffect(() => {
    if (!email) {
      toast.error("Email is missing. Please go back to the sign-up page.");
      router.push("/auth/signin");
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, confirmationCode: verificationCode }), // Include email and confirmationCode
      });

      if (response.ok) {
        toast.success("Verification successful!");
        router.push("/auth/signin");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Verification failed");
      }
    } catch (error) {
      console.error("Error during verification:", error);
      toast.error("An error occurred during verification. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 ml-64 relative">
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
        <h2 className="text-2xl font-bold text-center mb-6">
          Enter Verification Code
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Verification Code Field */}
          <div>
            <label
              htmlFor="verificationCode"
              className="block text-gray-700 font-semibold mb-2"
            >
              Verification Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter the code sent to your email"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerificationForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationContent />
    </Suspense>
  );
}
