"use client";
import React, { useEffect, useState } from 'react';
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

  const fetchCourses = async () => {
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
  };

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

  return (
    <div className="flex h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Sidebar */}
      <div className="fixed h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 pl-20 lg:pl-56 ml-16 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Course Management</h2>

        {/* Tabs */}
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-6 py-2 font-semibold rounded-lg shadow-md transition duration-300 ${
              activeTab === "waiting"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab("waiting")}
          >
            Waiting for Approval
          </button>
          <button
            className={`px-6 py-2 font-semibold rounded-lg shadow-md transition duration-300 ${
              activeTab === "approved"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab("approved")}
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
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        />

        {/* Loader */}
        {loading ? (
          <div className="flex items-center justify-center w-full h-64">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between border border-gray-300 p-4 rounded-lg shadow-sm bg-white"
                >
                  <div className="flex items-center space-x-4">
                    {/* Thumbnail */}
                    <img
                      src={course.thumbnailUrl || "/default-thumbnail.png"}
                      alt={`${course.title} thumbnail`}
                      className="w-16 h-16 rounded-lg"
                    />

                    {/* Course Details */}
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{course.title}</p>
                      <p className="text-sm text-gray-500">{course.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    {activeTab === "waiting" && (
                      <>
                        <button
                          className="px-4 py-2 font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-lg transition transform duration-300 hover:scale-105"
                          onClick={() => handleOpenModal('approve', course.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="px-4 py-2 font-semibold text-white bg-red-500 hover:bg-red-600 rounded-full shadow-lg transition transform duration-300 hover:scale-105"
                          onClick={() => handleOpenModal('reject', course.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {activeTab === "approved" && (
                      <button
                        className="px-4 py-2 font-semibold text-white bg-red-500 hover:bg-red-600 rounded-full shadow-lg transition transform duration-300 hover:scale-105"
                        onClick={() => handleOpenModal('delete', course.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No courses found.</p>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <p className="text-lg font-semibold mb-4">
              Are you sure you want to {confirmationModal.action} this course?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setConfirmationModal(null)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 ${confirmationModal.action === 'delete' ? 'bg-red-500' : 'bg-green-500'} text-white rounded hover:opacity-90`}
                onClick={handleConfirmAction}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
