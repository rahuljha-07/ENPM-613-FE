"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

export default function CourseManagementPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Please log in to view courses.");
        setIsLoading(false);
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
          setCourses(data.body);
          setFilteredCourses(data.body);
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to fetch courses.");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("An error occurred while fetching courses.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEdit = (id) => {
    router.push(`/manage-courses/module-view?id=${id}`);
  };

  useEffect(() => {
    const filtered = courses.filter(course => {
      const matchesStatus = filterStatus === 'ALL' || course.status === filterStatus;
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
    setFilteredCourses(filtered);
  }, [filterStatus, searchTerm, courses]);

  const statusDisplayText = {
    'DRAFT': 'DRAFT',
    'WAIT_APPROVAL': 'WAITING APPROVAL',
    'PUBLISHED': 'PUBLISHED',
    'REJECTED': 'REJECTED',
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-800 z-10">
        <Sidebar />
      </aside>

      <main className="flex-1 ml-64 p-8">
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />

        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">Course Applications</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus('DRAFT')}
              className={`px-4 py-2 rounded-md ${filterStatus === 'DRAFT' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              DRAFT
            </button>
            <button
              onClick={() => setFilterStatus('WAIT_APPROVAL')}
              className={`px-4 py-2 rounded-md ${filterStatus === 'WAIT_APPROVAL' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Waiting Approval
            </button>
            <button
              onClick={() => setFilterStatus('PUBLISHED')}
              className={`px-4 py-2 rounded-md ${filterStatus === 'PUBLISHED' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Published
            </button>
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-4 py-2 rounded-md ${filterStatus === 'ALL' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              All
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex w-full max-w-md">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none text-gray-800"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition duration-300">
              Search
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-dotted rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.length === 0 ? (
              <p className="text-center text-gray-200">No courses found.</p>
            ) : (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="border border-gray-300 rounded-lg p-4 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition duration-300"
                >
                  {/* Course Details */}
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

                  {/* Status and Edit Button */}
                  <div className="flex items-center space-x-4">
                    <span
                      className={`font-semibold text-sm px-3 py-1 rounded ${
                        course.status === "DRAFT"
                          ? "bg-yellow-200 text-yellow-800"
                          : course.status === "WAIT_APPROVAL"
                          ? "bg-blue-200 text-blue-800"
                          : course.status === "REJECTED"
                          ? "bg-red-200 text-red-800"
                          : course.status === "PUBLISHED"
                          ? "bg-green-200 text-green-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {statusDisplayText[course.status] || course.status}
                    </span>
                    {course.status === "DRAFT" && (
                      <button
                        onClick={() => handleEdit(course.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition duration-300"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
