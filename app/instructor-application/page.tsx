"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

// Set the API endpoint using the base URL from environment variables
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
  });
  const [profileImage, setProfileImage] = useState(null);
  const [resume, setResume] = useState(null);
  const [videoApplication, setVideoApplication] = useState(null);
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

  const handleFileChange = (e, setFile) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
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
      const formDataToSend = new FormData();
      formDataToSend.append("status", "PENDING");
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      if (profileImage) formDataToSend.append('profileImageUrl', profileImage);
      if (resume) formDataToSend.append('resumeUrl', resume);
      if (videoApplication) formDataToSend.append('videoApplicationUrl', videoApplication);

      const now = new Date().toISOString();
      formDataToSend.append("submittedAt", now);
      formDataToSend.append("reviewedAt", now);

      const response = await fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Application submitted successfully!');
        router.push('/instructor-dashboard');
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
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col p-8">
        <Toaster /> {/* Toaster component for notifications */}

        <h1 className="text-3xl font-bold mb-6">Instructor Application</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Disabled Fields */}
            <div>
              <label className="block font-semibold mb-2">Name</label>
              <input type="text" value={userInfo.name} disabled className="w-full border p-2 rounded-lg" required />
            </div>
            <div>
              <label className="block font-semibold mb-2">Birthdate</label>
              <input type="text" value={userInfo.birthdate} disabled className="w-full border p-2 rounded-lg" required />
            </div>
            <div>
              <label className="block font-semibold mb-2">Email</label>
              <input type="email" value={userInfo.email} disabled className="w-full border p-2 rounded-lg" required />
            </div>
            <div>
              <label className="block font-semibold mb-2">Role</label>
              <input type="text" value={userInfo.role} disabled className="w-full border p-2 rounded-lg" required />
            </div>

            {/* Editable Fields */}
            <div>
              <label className="block font-semibold mb-2">School Name</label>
              <input type="text" name="schoolName" value={formData.schoolName} onChange={handleInputChange} className="w-full border p-2 rounded-lg" required />
            </div>
            <div>
              <label className="block font-semibold mb-2">Degree Title</label>
              <input type="text" name="degreeTitle" value={formData.degreeTitle} onChange={handleInputChange} className="w-full border p-2 rounded-lg" required />
            </div>
            <div>
              <label className="block font-semibold mb-2">Graduation Date</label>
              <input type="date" name="graduateDate" value={formData.graduateDate} onChange={handleInputChange} className="w-full border p-2 rounded-lg" required />
            </div>

            {/* Professional Background */}
            <div>
              <label className="block font-semibold mb-2">Professional Title</label>
              <input type="text" name="professionalTitle" value={formData.professionalTitle} onChange={handleInputChange} className="w-full border p-2 rounded-lg" required />
            </div>
            <div>
              <label className="block font-semibold mb-2">Years of Experience</label>
              <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} className="w-full border p-2 rounded-lg" required />
            </div>

            {/* File Uploads */}
            <div className="flex flex-col items-center">
              <label className="block font-semibold mb-2">Upload Image</label>
              <input type="file" onChange={(e) => handleFileChange(e, setProfileImage)} accept="image/*" />
            </div>
            <div className="flex flex-col items-center">
              <label className="block font-semibold mb-2">Upload Resume</label>
              <input type="file" onChange={(e) => handleFileChange(e, setResume)} accept="application/pdf" />
            </div>
            <div className="flex flex-col items-center">
              <label className="block font-semibold mb-2">Video Application</label>
              <input type="file" onChange={(e) => handleFileChange(e, setVideoApplication)} accept="video/*" />
            </div>
          </div>

          {/* Teaching and Bio */}
          <div>
            <label className="block font-semibold mb-2">Teaching Experience</label>
            <textarea name="teachingExperience" value={formData.teachingExperience} onChange={handleInputChange} className="w-full border p-2 rounded-lg" required />
          </div>
          <div>
            <label className="block font-semibold mb-2">Instructor Bio</label>
            <textarea name="instructorBio" value={formData.instructorBio} onChange={handleInputChange} className="w-full border p-2 rounded-lg" required />
          </div>

          {/* Instructor Title */}
          <div>
            <label className="block font-semibold mb-2">Instructor Title</label>
            <input type="text" name="instructorTitle" value={formData.instructorTitle} onChange={handleInputChange} className="w-full border p-2 rounded-lg" required />
          </div>

          {/* Terms of Service */}
          <div className="flex items-center">
            <input type="checkbox" checked={agreeToTerms} onChange={() => setAgreeToTerms((prev) => !prev)} required />
            <label className="ml-2">I agree to the terms of service</label>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
