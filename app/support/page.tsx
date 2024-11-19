"use client";
 
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import React from 'react';
import { ToastContainer, toast } from "react-toastify";
import {
  PaperAirplaneIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid"; // Added Icons
import "react-toastify/dist/ReactToastify.css";
 
const BASE_URL = `${process.env.NEXT_PUBLIC_ILIM_BE}/support/issues`;
 
export default function SupportPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "LOW",
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // State to handle submission
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken"); // Get the token from localStorage
 
    // Basic form validation
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
 
    setIsSubmitting(true); // Start submission
 
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add Bearer token to headers
        },
        body: JSON.stringify(formData),
      });
 
      if (response.ok) {
        toast.success("Your message has been sent!");
        setFormData({ title: "", description: "", priority: "LOW" }); // Clear form data
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message || "Failed to send your message."}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("There was an error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false); // End submission
    }
  };
 
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
 
      <Sidebar /> {/* Sidebar component */}
 
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 ml-64"> {/* ml-64 offsets the fixed sidebar */}
        <div className="w-full max-w-lg bg-white text-gray-800 rounded-lg shadow-lg p-8">
          {/* Page Title */}
          <h1 className="text-4xl font-bold mb-6 text-center">Support</h1>
 
          {/* Introduction */}
          <section className="mb-8 text-center">
            <p className="text-lg text-gray-700">
              Have questions, feedback, or need help? We're here to assist you. Please fill out the form below, and our support team will get back to you as soon as possible.
            </p>
          </section>
 
          {/* Support Form */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center justify-center">
              <InformationCircleIcon className="h-6 w-6 text-blue-500 mr-2" />
              Contact Support
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter the issue title"
                  required
                />
              </div>
 
              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Describe your issue or question"
                  rows="5"
                  required
                ></textarea>
              </div>
 
              {/* Priority Field */}
              <div>
                <label htmlFor="priority" className="block text-gray-700 font-semibold mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  name="priority"
                  id="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
 
              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full flex items-center justify-center bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold ${
                  isSubmitting ? "cursor-not-allowed opacity-50" : ""
                }`}
                disabled={isSubmitting}
              >
                <PaperAirplaneIcon className="h-5 w-5 mr-2 transform rotate-45" />
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}