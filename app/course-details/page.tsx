"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import { Button } from '@/components/ui/button';
import { ToastContainer, toast } from 'react-toastify';
import dummyCourses from './dummyCourses.json'; // Import the dummy JSON data
import 'react-toastify/dist/ReactToastify.css';

const PUBLISHED_COURSES = `${process.env.NEXT_PUBLIC_ILIM_BE}/course-details`;
const DEFAULT_THUMBNAIL_URL = "https://as1.ftcdn.net/v2/jpg/05/79/68/24/1000_F_579682479_j4jRfx0nl3C8vMrTYVapFnGP8EgNHgfk.jpg";

export default function CourseDetailsPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(PUBLISHED_COURSES);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.body);
        setFilteredCourses(data.body);
        toast.success("Courses loaded successfully!");
      } else {
        throw new Error("Failed to load courses from API.");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses from API. Using dummy data.");
      setCourses(dummyCourses);
      setFilteredCourses(dummyCourses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    setFilteredCourses(
      courses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, courses]);

  const handleBuyClick = (course) => {
    const { id, title, description, instructor, rating, price } = course;
    const query = new URLSearchParams({
      title,
      description,
      instructor,
      rating,
      price,
    }).toString();
    router.push(`/course-details/course/${id}?${query}`);
  };

  return (
    <div className="flex h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      <Sidebar />

      <div className="flex-1 p-6 ml-12 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Available Courses</h1>
          <div className="flex items-center mb-6">
            <input
              type="text"
              placeholder="Search Courses"
              className="flex-1 px-4 py-2 border rounded-lg border-gray-300 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center w-full h-64">
            <div style={loaderStyle}></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div key={course.id} className="flex border rounded-lg p-4 items-start bg-white shadow">
                  <img
                    src={course.thumbnailUrl || DEFAULT_THUMBNAIL_URL}
                    alt={course.title}
                    className="w-24 h-24 bg-gray-200 flex-shrink-0 rounded mr-4 object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_THUMBNAIL_URL;
                    }}
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{course.title}</h2>
                    <p className="text-gray-600 text-sm mt-2">
                      {course.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                      <span>{course.modules.length} Modules</span>
                      <span>💲 {course.price}</span>
                      <span>Status: {course.status}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="ml-4" onClick={() => handleBuyClick(course)}>
                    Buy
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No courses available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Inline loader style
const loaderStyle = {
  border: '4px solid #f3f3f3',
  borderTop: '4px solid #3498db',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  animation: 'spin 1s linear infinite',
};

// Adding keyframes for the spinner animation
if (typeof window !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  `;
  document.head.appendChild(styleElement);
}
