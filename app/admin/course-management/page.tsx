"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CourseManagement() {
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("waiting"); // "waiting" or "approved"
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmationModal, setConfirmationModal] = useState(null); // Modal state

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [activeTab, searchTerm, courses]);

  const getAccessToken = () => localStorage.getItem('accessToken');

  const fetchCourses = useCallback(async () => {
    const token = getAccessToken();
    const endpoint = `${BASE_URL}/admin/course/all`;

    if (!BASE_URL || !token) {
      console.error("BASE_URL or token is not defined");
      toast.error("Failed to load courses. Please check your credentials.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (response.ok) {
        const filtered = result.body.filter(course => !course.isDeleted);
        setCourses(filtered); // Set courses excluding deleted ones
      } else {
        toast.error(`Error: ${result.message || 'Failed to load courses'}`);
      }
    } catch (error) {
      toast.error('Failed to connect to the API');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  const filterCourses = () => {
    let filtered = courses;

    if (activeTab === 'waiting') {
      filtered = filtered.filter(course => course.status === 'WAIT_APPROVAL');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(course => course.status === 'PUBLISHED');
    }

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    setFilteredCourses(filtered);
  };

  const handleDeleteCourse = async (courseId) => {
    const token = getAccessToken();
    const endpoint = `${BASE_URL}/admin/delete-course/${courseId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success("Course deleted successfully!");
        fetchCourses(); // Refresh the course list after deletion
      } else {
        const result = await response.json();
        toast.error(`Error: ${result.message || 'Something went wrong'}`);
      }
    } catch (error) {
      toast.error('Failed to connect to the API');
      console.error(error);
    } finally {
      setConfirmationModal(null); // Close the modal
    }
  };

  const handleApproveCourse = async (courseId) => {
    const token = getAccessToken();
    const endpoint = `${BASE_URL}/admin/approve-course/${courseId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success("Course approved successfully!");
        fetchCourses();
      } else {
        const result = await response.json();
        toast.error(`Error: ${result.message || 'Something went wrong'}`);
      }
    } catch (error) {
      toast.error('Failed to connect to the API');
      console.error(error);
    } finally {
      setConfirmationModal(null); // Close the modal
    }
  };

  const handleRejectCourse = async (courseId) => {
    const token = getAccessToken();
    const endpoint = `${BASE_URL}/admin/reject-course/${courseId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success("Course rejected successfully!");
        fetchCourses();
      } else {
        const result = await response.json();
        toast.error(`Error: ${result.message || 'Something went wrong'}`);
      }
    } catch (error) {
      toast.error('Failed to connect to the API');
      console.error(error);
    } finally {
      setConfirmationModal(null); // Close the modal
    }
  };

  const handleOpenModal = (action, courseId) => {
    setConfirmationModal({ action, courseId });
  };

  const handleConfirmAction = () => {
    if (confirmationModal.action === 'delete') {
      handleDeleteCourse(confirmationModal.courseId);
    } else if (confirmationModal.action === 'approve') {
      handleApproveCourse(confirmationModal.courseId);
    } else if (confirmationModal.action === 'reject') {
      handleRejectCourse(confirmationModal.courseId);
    }
  };

  // Mapping of course status to display text
  const statusDisplayText = {
    'WAIT_APPROVAL': 'Waiting for Approval',
    'PUBLISHED': 'Approved',
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
        <h2 className="text-4xl font-bold mb-6 text-white">Course Management</h2>

        {/* Tabs for Filtering */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("waiting")}
            className={`px-6 py-3 rounded-md font-semibold ${
              activeTab === "waiting"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            } transition duration-300`}
          >
            Waiting for Approval
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-6 py-3 rounded-md font-semibold ${
              activeTab === "approved"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            } transition duration-300`}
          >
            Approved Courses
          </button>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search courses by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Loader */}
        {loading ? (
          <div className="flex items-center justify-center w-full h-64">
            <div className="loader border-t-4 border-white rounded-full w-16 h-16 animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col md:flex-row items-center justify-between border border-gray-300 p-6 rounded-lg shadow-sm bg-white text-gray-800 space-y-4 md:space-y-0"
                >
                  {/* Clickable Thumbnail and Title */}
                  <div
                    className="flex items-center space-x-4 cursor-pointer hover:underline"
                    onClick={() => window.location.href = `/admin/course-management/${course.id}`}
                    tabIndex="0"
                    role="button"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        window.location.href = `/admin/course-management/${course.id}`;
                      }
                    }}
                    aria-label={`View details for ${course.title}`}
                  >
                    {/* Thumbnail */}
                    <img
                      src={course.thumbnailUrl || "/default-thumbnail.png"}
                      alt={`${course.title} thumbnail`}
                      className="w-16 h-16 rounded-lg border object-cover"
                    />

                    {/* Course Details */}
                    <div>
                      <p className="text-xl font-semibold">{course.title}</p>
                      <p className="text-sm text-gray-600">{course.description}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`font-semibold text-sm px-3 py-1 rounded-full ${
                      course.status === "WAIT_APPROVAL"
                        ? "bg-yellow-200 text-yellow-800"
                        : course.status === "PUBLISHED"
                        ? "bg-green-200 text-green-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {statusDisplayText[course.status] || course.status}
                  </span>

                  {/* Actions */}
                  <div className="flex space-x-4">
                    {activeTab === "waiting" && (
                      <>
                        <button
                          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300 shadow-lg transform hover:scale-105"
                          onClick={() => handleOpenModal('approve', course.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 shadow-lg transform hover:scale-105"
                          onClick={() => handleOpenModal('reject', course.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {activeTab === "approved" && (
                      <button
                        className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 shadow-lg transform hover:scale-105"
                        onClick={() => handleOpenModal('delete', course.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center mt-20">
                <p className="text-2xl font-semibold text-gray-300">No courses found.</p>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmationModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                {confirmationModal.action === "approve" ? "Approve" : confirmationModal.action === "reject" ? "Reject" : "Delete"} Course
              </h3>
              <p className="mb-4 text-gray-800">
                Are you sure you want to {confirmationModal.action} this course?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-300"
                  onClick={() => setConfirmationModal(null)}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 text-white rounded-md ${
                    confirmationModal.action === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                  } transition duration-300`}
                  onClick={handleConfirmAction}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
