"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

export default function CourseManagementPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Please log in to view courses.");
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/instructor/course/created`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCourses(data.body); // Set courses to data.body instead of data
        } else {
          toast.error("Failed to fetch courses.");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("An error occurred while fetching courses.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [BASE_URL]);

  // Updated handleEdit function to accept course id as a parameter
  const handleEdit = (id) => {
    router.push(`/manage-courses/module-view?id=${id}`);
  };

  const handleDelete = async (id) => {
    const confirmed = confirm("Are you sure you want to delete this course?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}/instructor/course/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Course deleted successfully!");
        setCourses(courses.filter((course) => course.id !== id));
      } else {
        toast.error("Failed to delete course.");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("An error occurred while deleting the course.");
    }
  };

  return (
    <div className="flex">
      {/* Sidebar with fixed positioning and full height */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-800 z-10">
        <Sidebar />
      </aside>

      {/* Main content with padding to prevent overlap */}
      <main className="flex-1 ml-64 p-8">
        <Toaster />
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Course Applications</h1>
          <button
            onClick={() => router.push('/course/upload')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Create a Course
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-dotted rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="border border-gray-300 rounded-lg p-4 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition duration-300"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-lg mr-4 overflow-hidden">
                    <img
                      src={course.thumbnailUrl || '/placeholder-image.png'}
                      alt="Course Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-gray-800">{course.title}</h2>
                    <p className="text-sm text-gray-500">{course.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Pass course.id to handleEdit */}
                  <button
                    onClick={() => handleEdit(course.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-300"
                  >
                    Delete
                  </button>
                  <span
                    className={`font-semibold text-sm px-3 py-1 rounded ${
                      course.status === "DRAFT"
                        ? "bg-yellow-200 text-yellow-800"
                        : course.status === "PENDING"
                        ? "bg-blue-200 text-blue-800"
                        : course.status === "REJECTED"
                        ? "bg-red-200 text-red-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {course.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
