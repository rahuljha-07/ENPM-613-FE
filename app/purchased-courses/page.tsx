"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import { Button } from '@/components/ui/button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PurchasedCoursesPage() {
  const router = useRouter();
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

  // Function to fetch purchased courses
  const fetchPurchasedCourses = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('Access token not found. Please log in.');
      }

      const response = await fetch(`${BASE_URL}/student/course/purchased`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to fetch purchased courses.'
        );
      }

      const data = await response.json();

      const courses = data.body.map((course) => ({
        id: course.id,
        title: course.title,
        instructor: course.instructorId,
        date: new Date(course.createdAt).toLocaleDateString(),
        thumbnailUrl: course.thumbnailUrl,
        description: course.description,
      }));

      setPurchasedCourses(courses);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchPurchasedCourses();
  }, [fetchPurchasedCourses]);

  const handleContinueClick = (courseId) => {
    const query = new URLSearchParams({
      courseId
    }).toString();
    router.push(`purchased-courses/course-info/${courseId}?${query}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="loader border-t-4 border-white rounded-full w-16 h-16 animate-spin"></div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-2xl font-semibold text-red-500">Error: {error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-800 z-10">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Enlarged Title */}
        <h2 className="text-4xl font-bold mb-6 text-white">Purchased Courses</h2>
        <p className="text-lg font-medium text-white mb-8">Welcome back! Here are your enrolled courses.</p>

        {purchasedCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <p className="text-2xl font-semibold text-gray-300">You have not purchased any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white text-gray-800 p-6 rounded-lg shadow-lg flex flex-col justify-between transition duration-300 hover:shadow-xl"
              >
                {/* Non-Clickable Thumbnail and Title */}
                <div className="flex flex-col space-y-4">
                  {/* Thumbnail */}
                  {course.thumbnailUrl && (
                    <img
                      src={course.thumbnailUrl}
                      alt={`${course.title} thumbnail`}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  )}
                  {/* Course Details */}
                  <div>
                    <h2 className="text-2xl font-semibold">{course.title}</h2>
                    {/* Instructor information is kept for logic but not displayed */}
                    <p className="text-gray-500 text-s">Date Purchased: {course.date}</p>
                  </div>
                </div>

                {/* Course Description */}
                <p className="text-gray-700 mt-4">{course.description || "No description available."}</p>

                {/* Continue Button */}
                <div className="mt-6">
                  <Button
                    onClick={() => handleContinueClick(course.id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition duration-200 shadow-md"
                    aria-label={`Continue to ${course.title}`}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
