"use client";

import React, { useEffect, useState, useCallback } from 'react';
import AWS from 'aws-sdk';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DEFAULT_PROFILE_IMAGE = "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";
const BUCKET_NAME = 'ilim-assets';

const s3 = new AWS.S3({
  accessKeyId: 'YOUR_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  region: 'us-east-2',
  signatureVersion: 'v4',
});

export default function ApproveInstructorApplication() {
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [actionType, setActionType] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Filter applications based on selected status
  useEffect(() => {
    const filtered = applications.filter(application => {
      const matchesStatus = filterStatus === 'ALL' || application.status === filterStatus;
      return matchesStatus;
    });
    setFilteredApplications(filtered);
  }, [filterStatus, applications]);

  // Get access token from local storage
  const getAccessToken = () => localStorage.getItem('accessToken');

  // Fetch applications from the API
  const fetchApplications = useCallback(async () => {
    const token = getAccessToken();
    if (!BASE_URL || !token) {
      toast.error("Failed to load applications. Please check your credentials.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/admin/instructor-application/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (response.ok) {
        setApplications(result.body);
        setFilteredApplications(result.body);
      } else {
        toast.error(`Error: ${result.message || 'Failed to load applications'}`);
      }
    } catch (error) {
      toast.error('Failed to connect to the API');
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  // Handle approve/reject action click
  const handleActionClick = (id, action) => {
    setSelectedApplicationId(id);
    setActionType(action);
    setIsModalOpen(true);
  };

  // Open the modal with the selected application details
  const handleTileClick = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  // Submit the approve/reject action to the API
  const handleSubmit = async () => {
    const token = getAccessToken();
    const endpoint = actionType === "approve"
      ? `${BASE_URL}/admin/approve-instructor-application`
      : `${BASE_URL}/admin/reject-instructor-application`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorApplicationId: selectedApplicationId,
          message
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(`Instructor application ${actionType}d successfully!`);
      } else {
        toast.error(`Error: ${result.message || 'Something went wrong'}`);
      }
    } catch (error) {
      toast.error('Failed to connect to the API');
    } finally {
      setIsModalOpen(false);
      setMessage("");
      fetchApplications();
    }
  };

  // Close the modal and reset message and selected application
  const handleCancel = () => {
    setIsModalOpen(false);
    setMessage("");
    setSelectedApplication(null);
  };

  // Map status codes to display text
  const statusDisplayText = {
    'PENDING': 'Pending',
    'APPROVED': 'Approved',
    'REJECTED': 'Rejected',
  };

  return (
    <div className="flex h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Sidebar */}
      <div className="fixed h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 pl-20 lg:pl-56 ml-16 overflow-y-auto bg-white">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Instructor Applications</h2>

        {/* Filter Buttons */}
        <div className="flex space-x-4 mb-6">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-2 font-semibold rounded-lg shadow-md transition duration-300 ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {statusDisplayText[status] || status}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex items-center justify-center w-full h-64">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <div
                  key={application.id}
                  onClick={() => handleTileClick(application)}
                  className="flex items-center justify-between border border-gray-300 p-4 rounded-lg shadow-sm bg-white text-gray-800 cursor-pointer"
                >
                  {/* Name Display */}
                  <div className="flex items-center space-x-4">
                    <img
                      src={application.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                      alt="Profile"
                      className="w-16 h-16 rounded-full border object-cover"
                    />
                    <p className="text-lg font-semibold">{application.instructorTitle}</p>
                  </div>

                  {/* Approve and Reject Buttons */}
                  {application.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-lg transition transform duration-300 hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionClick(application.id, "approve");
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="px-4 py-2 font-semibold text-white bg-red-500 hover:bg-red-600 rounded-full shadow-lg transition transform duration-300 hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionClick(application.id, "reject");
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No instructor applications available.</p>
            )}
          </div>
        )}

        {/* Modal for Application Details */}
        {isModalOpen && selectedApplication && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto text-black">
              <h3 className="text-2xl font-semibold mb-4">Instructor Application Details</h3>
              <img
                src={selectedApplication.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-4 shadow-md"
              />
              <p><strong>Name:</strong> {selectedApplication.instructorTitle}</p>
              <p><strong>Professional Title:</strong> {selectedApplication.professionalTitle}</p>
              <p><strong>School:</strong> {selectedApplication.schoolName}</p>
              <p><strong>Degree:</strong> {selectedApplication.degreeTitle}</p>
              <p><strong>Graduation Date:</strong> {selectedApplication.graduateDate}</p>
              <p><strong>Experience:</strong> {selectedApplication.experienceYears} years</p>
              <p><strong>Teaching Experience:</strong> {selectedApplication.teachingExperience}</p>
              <p><strong>Bio:</strong> {selectedApplication.instructorBio}</p>
              <p>
                <strong>Resume:</strong>{' '}
                {selectedApplication.resumeUrl ? (
                  <a
                    href={selectedApplication.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    Download Resume
                  </a>
                ) : (
                  <span>No resume available</span>
                )}
              </p>

              <div className="flex justify-end mt-6">
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
                  onClick={handleCancel}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
