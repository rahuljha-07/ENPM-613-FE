"use client";

import { useState } from "react";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here, you can add code to handle form submission, like sending data to an API
    alert("Your message has been sent!");
    setFormData({ name: "", email: "", message: "" }); // Reset form after submission
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
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
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-gray-700 font-semibold">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-gray-700 font-semibold">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-gray-700 font-semibold">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Describe your issue or question"
                required
              />
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

        {/* FAQ Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <ul className="space-y-4">
            <li>
              <h3 className="text-lg font-semibold">How do I reset my password?</h3>
              <p className="text-gray-700">You can reset your password by clicking on the "Forgot Password" link on the login page.</p>
            </li>
            <li>
              <h3 className="text-lg font-semibold">How can I update my profile information?</h3>
              <p className="text-gray-700">Go to your profile page, and click on "Edit Profile" to update your information.</p>
            </li>
            <li>
              <h3 className="text-lg font-semibold">Who do I contact for billing issues?</h3>
              <p className="text-gray-700">For billing issues, please use the form above or email us at <a href="mailto:support@ilim.com" className="text-blue-500 hover:underline">support@ilim.com</a>.</p>
            </li>
          </ul>
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
  );
}
