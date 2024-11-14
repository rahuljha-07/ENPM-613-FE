"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { PaperAirplaneIcon, InformationCircleIcon } from '@heroicons/react/24/solid'; // Added Icons
import 'react-toastify/dist/ReactToastify.css';

const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;
const SUBMIT_ENDPOINT = `${BASE_URL}/student/instructor-application/submit`;

export default function InstructorApplicationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    schoolName: '',
    degreeTitle: '',
    graduateDate: '',
    professionalTitle: '',
    experienceYears: '',
    teachingExperience: '',
    instructorTitle: '',
    instructorBio: '',
    videoApplicationUrl: null,
    profileImageUrl: null,
    resumeUrl: null,
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Disabled fields
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    birthdate: '',
    role: '',
  });

  useEffect(() => {
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const birthdate = localStorage.getItem('birthdate');
    const role = localStorage.getItem('role');
    setUserInfo({
      name: name || '',
      email: email || '',
      birthdate: birthdate || '',
      role: role || '',
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeToTerms) {
      toast.error('Please agree to the terms of service');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('No token found, please log in');
      setIsSubmitting(false);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        videoApplicationUrl: null,
        profileImageUrl: null,
        resumeUrl: null,
      };

      const response = await fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast.success('Application submitted successfully!');
        router.push('/course-details');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to submit application: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Error submitting application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 ml-64"> {/* ml-64 offsets the fixed sidebar */}
        <div className="w-full max-w-3xl bg-white text-gray-800 rounded-lg shadow-lg p-8">
          {/* Page Title */}
          <h1 className="text-4xl font-bold mb-6 text-center">Instructor Application</h1>

          {/* Introduction */}
          <section className="mb-8 text-center">
            <p className="text-lg text-gray-700">
              Interested in becoming an instructor? Please fill out the application form below, and our team will review your submission.
            </p>
          </section>

          {/* Instructor Application Form */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center justify-center">
              <InformationCircleIcon className="h-6 w-6 text-blue-500 mr-2" />
              Application Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Disabled Fields */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    value={userInfo.name}
                    disabled
                    className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Birthdate</label>
                  <input
                    type="text"
                    value={userInfo.birthdate}
                    disabled
                    className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={userInfo.email}
                    disabled
                    className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Role</label>
                  <input
                    type="text"
                    value={userInfo.role}
                    disabled
                    className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100"
                    required
                  />
                </div>

                {/* Editable Fields */}
                <div>
                  <label htmlFor="schoolName" className="block text-gray-700 font-semibold mb-2">
                    School Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    id="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter your school name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="degreeTitle" className="block text-gray-700 font-semibold mb-2">
                    Degree Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="degreeTitle"
                    id="degreeTitle"
                    value={formData.degreeTitle}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter your degree title"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="graduateDate" className="block text-gray-700 font-semibold mb-2">
                    Graduation Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="graduateDate"
                    id="graduateDate"
                    value={formData.graduateDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                {/* Professional Background */}
                <div>
                  <label htmlFor="professionalTitle" className="block text-gray-700 font-semibold mb-2">
                    Professional Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="professionalTitle"
                    id="professionalTitle"
                    value={formData.professionalTitle}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter your professional title"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="experienceYears" className="block text-gray-700 font-semibold mb-2">
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    id="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter your years of experience"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Teaching and Bio */}
              <div>
                <label htmlFor="teachingExperience" className="block text-gray-700 font-semibold mb-2">
                  Teaching Experience <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="teachingExperience"
                  id="teachingExperience"
                  value={formData.teachingExperience}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Describe your teaching experience"
                  rows="4"
                  required
                ></textarea>
              </div>
              <div>
                <label htmlFor="instructorBio" className="block text-gray-700 font-semibold mb-2">
                  Instructor Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="instructorBio"
                  id="instructorBio"
                  value={formData.instructorBio}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Tell us about yourself"
                  rows="4"
                  required
                ></textarea>
              </div>

              {/* Instructor Title */}
              <div>
                <label htmlFor="instructorTitle" className="block text-gray-700 font-semibold mb-2">
                  Instructor Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="instructorTitle"
                  id="instructorTitle"
                  value={formData.instructorTitle}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter your desired instructor title"
                  required
                />
              </div>

              {/* Terms of Service */}
              {/* <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onChange={() => setAgreeToTerms((prev) => !prev)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-gray-700">
                  I agree to the <a href="/terms" className="text-blue-500 hover:underline">terms of service</a>.
                </label>
              </div> */}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold ${
                  isSubmitting ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                <PaperAirplaneIcon className="h-5 w-5 mr-2 transform rotate-45" />
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
