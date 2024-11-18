"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { EyeIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const PUBLISHED_COURSES = `${process.env.NEXT_PUBLIC_ILIM_BE}/course/published`;
const DEFAULT_THUMBNAIL_URL = "https://as1.ftcdn.net/v2/jpg/05/79/68/24/1000_F_579682479_j4jRfx0nl3C8vMrTYVapFnGP8EgNHgfk.jpg";

export default function CoursesPage() {
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

  const handleTileClick = (course) => {
    const { id } = course;
    router.push(`/course-details/course/${id}`);
  };

  const handleViewClick = (course) => {
    const { id } = course;
    router.push(`/course-details/course/${id}`);
  };

  return (
    <motion.div
      className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white"
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-start p-8 ml-64"
      >
        <motion.div
          className="w-full max-w-6xl bg-white text-gray-800 rounded-lg shadow-lg p-8"
        >
          {/* Page Title */}
          <motion.div
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
              📚 Available Courses
            </h1>
            <p className="text-lg text-gray-600">
              Explore and choose a course to begin your learning journey!
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="mb-6 flex justify-center"
          >
            <input
              type="text"
              placeholder="Search Courses"
              className="w-full max-w-md px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>

          {/* Courses List */}
          <AnimatePresence>
            {loading ? (
              <motion.div
                className="flex items-center justify-center w-full h-64"
              >
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12"></div>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-4"
              >
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <motion.div
                      key={course.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300 cursor-pointer"
                      onClick={() => handleTileClick(course)}
                      style={{ minHeight: '80px' }} // Allow the tile to expand for long descriptions
                    >
                      {/* Course Thumbnail */}
                      <img
                        src={course.thumbnailUrl || DEFAULT_THUMBNAIL_URL}
                        alt={course.title}
                        className="w-16 h-16 object-cover rounded-full mr-4 flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_THUMBNAIL_URL;
                        }}
                      />

                      {/* Course Details */}
                      <div className="flex-1 overflow-hidden">
                        <h2 className="text-xl font-semibold">{course.title}</h2>
                        <p className="text-gray-600 text-sm overflow-hidden overflow-ellipsis">{course.description}</p>
                        <p className="text-gray-600 text-sm">
                          {course.modules.length} Modules
                        </p>
                      </div>

                      {/* Course Price */}
                      <span className="text-black font-bold mx-4 flex-shrink-0 self-center">
                        ${course.price}
                      </span>

                      {/* View Button */}
                      <motion.div
                        className="ml-4 flex-shrink-0 self-center"
                      >
                        <Button
                          variant="secondary"
                          className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents triggering handleTileClick
                            handleViewClick(course);
                          }}
                        >
                          <EyeIcon className="h-5 w-5 mr-1" />
                          View
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))
                ) : (
                  <motion.p
                    className="text-center text-gray-500"
                  >
                    No courses available.
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
