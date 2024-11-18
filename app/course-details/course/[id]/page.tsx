"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import { XMarkIcon } from '@heroicons/react/24/solid';

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState([]);
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

  const courseId = params.id;

  /**
   * Fetch course details from the backend.
   */
  const fetchCourseDetails = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token not found. Please log in.');
      }

      const response = await fetch(`${BASE_URL}/course/${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course details.');
      }

      const data = await response.json();
      setCourse(data.body);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert('Error fetching course details. Please try again later.');
    }
  };

  /**
   * Fetch IDs of courses that the user has purchased.
   */
  const fetchPurchasedCourseIds = async () => {
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
      const courseIds = data.body.map((course) => course.id);
      setPurchasedCourseIds(courseIds);
    } catch (error) {
      console.error('Error fetching purchased courses:', error);
    }
  };

  /**
   * Handle payment process initiation.
   */
  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token not found. Please log in.');
      }

      // Initiate purchase request
      const response = await fetch(`${BASE_URL}/student/purchase-course/${courseId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const stripeUrl = data.body;

        // Open Stripe payment page in new tab
        window.open(stripeUrl, '_blank');

        // Start polling for payment status
        pollPaymentStatus();
      } else {
        console.error('Error initiating purchase');
        setPaymentLoading(false);
        alert('Failed to initiate purchase. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setPaymentLoading(false);
      alert('An error occurred during payment. Please try again.');
    }
  };

  /**
   * Poll the backend to check the payment status.
   */
  const pollPaymentStatus = () => {
    const interval = setInterval(async () => {
      if (attempts >= 30) {
        clearInterval(interval);
        setPaymentLoading(false);
        alert('Payment verification timed out. Please try again.');
        return;
      }

      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('Access token not found. Please log in.');
        }

        const response = await fetch(`${BASE_URL}/student/course/${courseId}/check-purchase`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.body === 'SUCCEEDED') {
            clearInterval(interval);
            setPaymentLoading(false);
            alert('Purchase successful! Redirecting to your courses.');
            router.push('/purchased-courses');
          } else {
            setAttempts((prev) => prev + 1);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        clearInterval(interval);
        setPaymentLoading(false);
        alert('An error occurred while verifying payment. Please try again.');
      }
    }, 5000); // 5000ms interval
  };

  /**
   * Handle redirection to the Course Info page.
   * Removed as per user request.
   */

  /**
   * Fetch course details and purchased courses upon component mount.
   */
  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchPurchasedCourseIds();
    } else {
      console.error('courseId is missing in route parameters.');
      alert('Course ID is missing. Redirecting to courses page.');
      router.push('/purchased-courses');
    }
  }, [courseId]);

  /**
   * Determine if the current user has purchased the course.
   */
  const isCoursePurchased = purchasedCourseIds.includes(courseId);
  const userRole = localStorage.getItem('role'); // Get user role from localStorage

  /**
   * Render loading state.
   */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-700">Loading course details...</p>
      </div>
    );
  }

  /**
   * Render error state if course details fail to load.
   */
  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Failed to load course details.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <Sidebar />

      <div className="flex-1 p-8 ml-64">
        {/* Course Overview Title */}
        <h1 className="text-4xl font-bold mb-6">Course Overview</h1>

        {/* Back Button and Buy Button */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 font-semibold px-4 py-2 rounded-lg bg-white shadow-md transition duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Courses
          </button>

          {/* Conditional Rendering of Buy Button */}
          {userRole !== 'ADMIN' && !isCoursePurchased && (
            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className={`flex items-center text-white bg-green-500 hover:bg-green-600 font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ${
                paymentLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {paymentLoading ? 'Processing...' : 'Buy Course'}
            </button>
          )}
        </div>

        {/* Course Details */}
        <div className="bg-white text-gray-800 p-8 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-gray-500 text-sm">
                Created At: {new Date(course.createdAt).toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm">
                Updated At: {new Date(course.updatedAt).toLocaleString()}
              </p>
              <p className="text-gray-800 text-xl font-semibold mt-2">
                Price: ${course.price}
              </p>
            </div>
            {course.thumbnailUrl && (
              <div className="flex flex-col items-center">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-48 h-32 object-cover rounded-lg shadow-md"
                />
              </div>
            )}
          </div>

          <p className="text-gray-700 mb-8">
            {course.description || 'No description available.'}
          </p>

          {/* Modules Displayed as Non-clickable Tiles */}
          <h2 className="text-xl font-semibold mb-4">Modules</h2>
          <div className="space-y-4">
            {(() => {
              // Determine the modules based on user role
              const modules =
                userRole === 'ADMIN' || userRole === 'INSTRUCTOR'
                  ? course?.courseModules
                  : course?.modules;

              // Check if modules exist and have at least one item
              if (Array.isArray(modules) && modules.length > 0) {
                return modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-md h-full"
                    style={{ cursor: 'default' }}
                  >
                    <div>
                      <h3 className="font-semibold text-lg">
                        Module {index + 1}: {module.title}
                      </h3>
                      <p className="text-gray-500">{module.description}</p>
                    </div>
                  </div>
                ));
              } else {
                // Display a message if no modules are available
                return (
                  <p className="text-gray-500">No modules available for this course.</p>
                );
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
