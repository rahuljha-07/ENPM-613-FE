"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { uploadFileToS3 } from '../../../lib/s3'; // Import the S3 upload function

export default function UploadCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTOS, setShowTOS] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

  const handleThumbnailChange = (e) => {
    if (e.target.files.length > 0) {
      setThumbnail(e.target.files[0]);
    }
  };

  const uploadThumbnailToS3 = async (file) => {
    const id = localStorage.getItem('id');
    const extension = file.name.split('.').pop();
    const sanitizedTitle = title.replace(/\s+/g, '-').toLowerCase(); // Sanitize title for filename
    const fileName = `${id}-${sanitizedTitle}-thumbnail.${extension}`;

    try {
      const fileUrl = await uploadFileToS3(file, fileName);
      return fileUrl;
    } catch (error) {
      console.error("Error uploading thumbnail to S3:", error);
      throw new Error("Failed to upload thumbnail");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showTOS) return;
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
      let thumbnailUrl = '';
      if (thumbnail) {
        thumbnailUrl = await uploadThumbnailToS3(thumbnail);
      }

      const payload = {
        title,
        description,
        price,
        thumbnailUrl,
      };

      const response = await fetch(`${BASE_URL}/instructor/create-course`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Course created successfully!');
        setTitle('');
        setDescription('');
        setPrice('');
        setThumbnail(null);
        setAgreeToTerms(false);
        router.push('/manage-courses/course-management');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create course: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error uploading course:', error);
      toast.error('Error uploading course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      {/* Toast Container */}
      <Toaster position="top-right" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 ml-64">
        {/* Form Container */}
        <div className="w-full max-w-3xl bg-white text-gray-800 rounded-lg shadow-lg p-8">
          {/* Terms of Service Modal */}
          {showTOS && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 w-11/12 max-w-lg relative">
                <button
                  onClick={() => setShowTOS(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Terms of Service</h2>
                <p className="text-gray-700 mb-6">
                  Welcome to iLIM! By using our services, you agree to comply with our Terms of Service. Please review the terms carefully to understand your responsibilities and our commitment to providing a safe and educational environment.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Respect the community and other users.</li>
                  <li>Avoid sharing misleading or inaccurate information.</li>
                  <li>Follow all applicable laws and regulations.</li>
                  <li>Do not misuse or abuse the resources available on iLIM.</li>
                </ul>
                <p className="text-gray-700 mt-6">
                  For more details, contact our support team or continue to explore iLIM’s guidelines.
                </p>
              </div>
            </div>
          )}

          {/* Form Title */}
          <h1 className="text-3xl font-bold mb-6 text-center">Create a Course</h1>

          {/* Course Creation Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Title */}
            <div>
              <label className="block font-semibold mb-2" htmlFor="title">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your course title"
                required
              />
            </div>

            {/* Course Description */}
            <div>
              <label className="block font-semibold mb-2" htmlFor="description">
                Course Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:border-blue-500 transition-colors h-24"
                placeholder="Describe your course"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block font-semibold mb-2" htmlFor="price">
                Price in USD <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter the course price"
                min="0"
                required
              />
            </div>

            {/* Upload Thumbnail */}
            <div className="flex items-center space-x-4">
              <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {thumbnail ? (
                  <img
                    src={URL.createObjectURL(thumbnail)}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-gray-500">No Image</span>
                )}
              </div>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => document.getElementById('thumbnailInput').click()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-2 hover:bg-blue-700 transition-colors"
                >
                  Choose Thumbnail
                </button>
                <input
                  id="thumbnailInput"
                  type="file"
                  onChange={handleThumbnailChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                {thumbnail && (
                  <span className="text-gray-700 mt-2">{thumbnail.name}</span>
                )}
              </div>
            </div>

            {/* Terms of Service */}
            {/* <div className="flex items-center">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-gray-700">
                I agree to the{" "}
                <button
                  onClick={() => setShowTOS(true)}
                  type="button"
                  className="text-blue-500 underline hover:text-blue-600"
                >
                  Terms of Service
                </button>
                .
              </label>
            </div> */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !title}
              title={!title ? 'Enter the title first' : ''}
              className={`${
                !title ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-6 py-2 rounded-lg w-full transition-colors font-semibold flex items-center justify-center`}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
