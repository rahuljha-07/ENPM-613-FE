"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ApproveInstructorApplication() {
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;
  const [applications, setApplications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    fetchApplications();
  }, []);

  const getAccessToken = () => localStorage.getItem('accessToken');

  const fetchApplications = useCallback(async () => {
    const token = getAccessToken();
    if (!BASE_URL || !token) {
      console.error("BASE_URL or token is not defined");
      toast.error("Failed to load applications. Please check your credentials.");
      return;
    }

    try {
      setLoading(true); // Start loading
      const response = await fetch(`${BASE_URL}/student/instructor-application/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (response.ok) {
        setApplications(result.body);
      } else {
        toast.error(`Error: ${result.message || 'Failed to load applications'}`);
      }
    } catch (error) {
      toast.error('Failed to connect to the API');
      console.error(error);
    } finally {
      setLoading(false); // End loading
    }
  }, [BASE_URL]);

  const handleActionClick = (id, action) => {
    setSelectedApplicationId(id);
    setActionType(action);
    setIsModalOpen(true);
  };

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
      console.error(error);
    } finally {
      // Close modal, clear message, and refresh list even if the API call fails
      setIsModalOpen(false);
      setMessage("");
      fetchApplications();
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setMessage(""); // Clear the message field on cancel
  };

  return (
    <div className="flex h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Sidebar */}
      <div className="fixed h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 pl-20 lg:pl-56 ml-16 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Instructor Applications</h2>

        {/* Loader */}
        {loading ? (
          <div className="flex items-center justify-center w-full h-64">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.length > 0 ? (
              applications.map((application) => (
                <div
                  key={application.id}
                  className="flex flex-col border border-gray-300 p-4 rounded-lg shadow-sm bg-white space-y-4"
                >
                  <div className="flex items-center space-x-4">
                    {/* Profile Image */}
                    <img
                      src={application.profileImageUrl || "/default-avatar.png"}
                      alt={`${application.userId}'s profile`}
                      className="w-12 h-12 rounded-full border"
                    />

                    {/* Name and Title */}
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{application.instructorTitle}</p>
                      <p className="text-sm text-gray-500">{application.professionalTitle}</p>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-2">
                    <p><strong>School:</strong> {application.schoolName}</p>
                    <p><strong>Degree:</strong> {application.degreeTitle}</p>
                    <p><strong>Experience:</strong> {application.experienceYears} years</p>
                    <p><strong>Bio:</strong> {application.instructorBio}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => toast.info('Viewing application details is not implemented yet')}
                    >
                      Check Application
                    </button>
                    <button
                      className="text-green-500 hover:underline"
                      onClick={() => handleActionClick(application.id, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleActionClick(application.id, "reject")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No instructor applications available.</p>
            )}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
              <h3 className="text-xl font-semibold mb-4">
                {actionType === "approve" ? "Approve" : "Reject"} Application
              </h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter a message..."
                className="w-full border border-gray-300 p-2 rounded-lg mb-4"
                rows={4}
              ></textarea>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
