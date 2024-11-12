"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import { Button } from '@/components/ui/button';
import { ToastContainer, toast } from 'react-toastify';
import dummyCourses from './dummyCourses.json';
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
      
      {/* Sidebar */}
      <div className="fixed h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 pl-20 lg:pl-56 ml-16 overflow-y-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2 tracking-tight">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
              📚 Available Courses
            </span>
          </h1>
          <p className="text-lg text-gray-600">Explore and choose a course to begin your learning journey!</p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6 flex items-center justify-center">
          <input
            type="text"
            placeholder="Search Courses"
            className="w-full max-w-lg px-4 py-2 border rounded-lg border-gray-300 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="flex items-center justify-center w-full h-64">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div key={course.id} className="bg-white border rounded-lg p-4 items-start shadow hover:shadow-md transition-shadow duration-300">
                  <img
                    src={course.thumbnailUrl || DEFAULT_THUMBNAIL_URL}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded mb-4"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_THUMBNAIL_URL;
                    }}
                  />
                  <div>
                    <h2 className="text-xl font-semibold">{course.title}</h2>
                    <p className="text-gray-600 text-sm mt-2 mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{course.modules.length} Modules</span>
                      <span>💲 {course.price}</span>
                      <span>Status: {course.status}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4 w-full" onClick={() => handleBuyClick(course)}>
                    Buy
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-full">No courses available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
