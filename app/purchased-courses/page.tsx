"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import { Button } from '@/components/ui/button';

export default function PurchasedCoursesPage() {
  const router = useRouter();
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

  // Function to fetch purchased courses
  const fetchPurchasedCourses = async () => {
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasedCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <div className="fixed top-0 left-0 h-full w-16 lg:w-48 bg-gray-800 text-white">
          <Sidebar />
        </div>

        <div className="flex-1 ml-20 lg:ml-60 p-8 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 h-screen">
          <p className="text-xl text-gray-700">Loading your purchased courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <div className="fixed top-0 left-0 h-full w-16 lg:w-48 bg-gray-800 text-white">
          <Sidebar />
        </div>

        <div className="flex-1 ml-20 lg:ml-60 p-8 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 h-screen">
          <p className="text-xl text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  const handleContinueClick = (courseId) => {
    const query = new URLSearchParams({
      courseId
    }).toString();
    router.push(`purchased-courses/course-info/${courseId}?${query}`);
  };

  return (
    <div className="flex">
      <div className="fixed top-0 left-0 h-full w-16 lg:w-48 bg-gray-800 text-white">
        <Sidebar />
      </div>

      <div className="flex-1 ml-20 lg:ml-60 p-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen overflow-y-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6">Purchased Courses</h1>
        <p className="text-lg font-medium text-gray-700 mb-8">Welcome back! Here are your enrolled courses.</p>

        {purchasedCourses.length === 0 ? (
          <p className="text-gray-600">You have not purchased any courses yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between"
              >
                <div>
                  {course.thumbnailUrl && (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-40 object-cover rounded-md mb-4"
                    />
                  )}

                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">{course.title}</h2>
                  <p className="text-gray-500 text-sm mb-2">Instructor: {course.instructor}</p>
                  <p className="text-gray-500 text-sm mb-4">Date Purchased: {course.date}</p>
                </div>

                <div className="mt-4">
                  <Button
                    onClick={() => handleContinueClick(course.id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition duration-200"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
