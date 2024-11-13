"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const BASE_URL = `${process.env.NEXT_PUBLIC_ILIM_BE}/support/issues`;

export default function SupportPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "LOW",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Your message has been sent!");
        setFormData({ title: "", description: "", priority: "LOW" }); // Clear form data
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("There was an error sending your message. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} /> {/* Toaster for notifications */}
      
      <Sidebar /> {/* Sidebar component */}

      <div className="flex-1 flex flex-col items-center p-6">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
          <h1 className="text-4xl font-bold mb-6 text-center">Support</h1>

          {/* Introduction */}
          <section className="mb-8 text-center">
            <p className="text-lg text-gray-700">
              Have questions, feedback, or need help? We're here to assist you. Please fill out the form below, and our support team will get back to you as soon as possible.
            </p>
          </section>

          {/* Support Form */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Support</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-gray-700 font-semibold">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter the issue title"
                  required
                />
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-gray-700 font-semibold">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Describe your issue or question"
                  required
                />
              </div>

              {/* Priority Field */}
              <div>
                <label htmlFor="priority" className="block text-gray-700 font-semibold">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
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
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Submit
              </button>
            </form>
          </section>

          {/* Contact Information */}
          <section className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Other Ways to Contact Us</h2>
            <p className="text-gray-700">
              You can also reach out to us at{" "}
              <a href="mailto:support@ilim.com" className="text-blue-500 hover:underline">
                support@ilim.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
