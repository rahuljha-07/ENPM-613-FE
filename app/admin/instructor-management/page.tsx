"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ApproveInstructorApplication() {
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    // Filter applications based on status only
    const filtered = applications.filter(application => {
      const matchesStatus = filterStatus === 'ALL' || application.status === filterStatus;
      return matchesStatus;
    });
    setFilteredApplications(filtered);
  }, [filterStatus, applications]);

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
        setFilteredApplications(result.body);
        // Removed the success toast to prevent multiple toasts
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

  // Mapping of application status to display text
  const statusDisplayText = {
    'PENDING': 'Pending',
    'APPROVED': 'Approved',
    'REJECTED': 'Rejected',
    // Add other statuses if any
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-800 z-10">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Enlarged Title */}
        <h2 className="text-4xl font-bold mb-6 text-white">Instructor Applications</h2>

        {/* Tabs for Filtering */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-6 py-3 rounded-md font-semibold ${
              filterStatus === 'PENDING'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition duration-300`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('APPROVED')}
            className={`px-6 py-3 rounded-md font-semibold ${
              filterStatus === 'APPROVED'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition duration-300`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilterStatus('REJECTED')}
            className={`px-6 py-3 rounded-md font-semibold ${
              filterStatus === 'REJECTED'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition duration-300`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-6 py-3 rounded-md font-semibold ${
              filterStatus === 'ALL'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition duration-300`}
          >
            All
          </button>
        </div>

        {/* Loader */}
        {loading ? (
          <div className="flex items-center justify-center w-full h-64">
            <div className="loader border-t-4 border-white rounded-full w-16 h-16 animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex flex-col md:flex-row items-center justify-between border border-gray-300 p-6 rounded-lg shadow-sm bg-white text-gray-800"
                >
                  {/* Clickable Profile Section */}
                  <div
                    className="flex items-center space-x-4 cursor-pointer hover:underline"
                    onClick={() => window.location.href = `/admin/instructor-application/${application.id}`}
                  >
                    {/* Profile Image */}
                    <img
                      src={application.profileImageUrl || "/default-avatar.png"}
                      alt={`${application.userId}'s profile`}
                      className="w-16 h-16 rounded-full border object-cover"
                    />

                    {/* Name and Title */}
                    <div>
                      <p className="text-xl font-semibold">{application.instructorTitle}</p>
                      <p className="text-sm text-gray-600">{application.professionalTitle}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`font-semibold text-sm px-3 py-1 rounded-full ${
                      application.status === "PENDING"
                        ? "bg-yellow-200 text-yellow-800"
                        : application.status === "APPROVED"
                        ? "bg-green-200 text-green-800"
                        : application.status === "REJECTED"
                        ? "bg-red-200 text-red-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {statusDisplayText[application.status] || application.status}
                  </span>

                  {/* Additional Information */}
                  <div className="space-y-2 mt-4 md:mt-0">
                    <p><strong>School:</strong> {application.schoolName}</p>
                    <p><strong>Degree:</strong> {application.degreeTitle}</p>
                    <p><strong>Experience:</strong> {application.experienceYears} years</p>
                    <p><strong>Bio:</strong> {application.instructorBio}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4 mt-4 md:mt-0">
                    {application.status === 'PENDING' && (
                      <>
                        <button
                          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300 shadow-lg transform hover:scale-105"
                          onClick={() => handleActionClick(application.id, "approve")}
                        >
                          Approve
                        </button>
                        <button
                          className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 shadow-lg transform hover:scale-105"
                          onClick={() => handleActionClick(application.id, "reject")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center mt-20">
                <p className="text-2xl font-semibold text-gray-300">No instructor applications available.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                {actionType === "approve" ? "Approve" : "Reject"} Application
              </h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter a message..."
                className="w-full border border-gray-300 p-2 rounded-lg mb-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              ></textarea>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-300"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
