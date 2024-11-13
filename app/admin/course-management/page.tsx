"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CourseManagement() {
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "waiting"
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [activeTab]);

  useEffect(() => {
    // Filter courses based on search term
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = courses.filter(course =>
      course.title.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  const getAccessToken = () => localStorage.getItem('accessToken');

  const fetchCourses = async () => {
    const token = getAccessToken();
    const endpoint = activeTab === "all"
      ? `${BASE_URL}/admin/course/all`
      : `${BASE_URL}/admin/course/wait-for-approval`;

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
        setCourses(result.body); // Update courses based on the response
        setFilteredCourses(result.body); // Initialize filtered courses
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
    }
  };

  const handleApproveCourse = async (courseId) => {
    // Placeholder for approve course API call
    toast.success(`Course approved!`);
    fetchCourses();
  };

  const handleRejectCourse = async (courseId) => {
    // Placeholder for reject course API call
    toast.success(`Course rejected!`);
    fetchCourses();
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
              activeTab === "all"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Courses
          </button>
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
                    {activeTab === "all" ? (
                      <button
                        className="px-4 py-2 font-semibold text-white bg-red-500 hover:bg-red-600 rounded-full shadow-lg transition transform duration-300 hover:scale-105"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        Delete
                      </button>
                    ) : (
                      <>
                        <button
                          className="px-4 py-2 font-semibold text-white bg-green-500 hover:bg-green-600 rounded-full shadow-lg transition transform duration-300 hover:scale-105"
                          onClick={() => handleApproveCourse(course.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="px-4 py-2 font-semibold text-white bg-red-500 hover:bg-red-600 rounded-full shadow-lg transition transform duration-300 hover:scale-105"
                          onClick={() => handleRejectCourse(course.id)}
                        >
                          Reject
                        </button>
                      </>
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
    </div>
  );
}
