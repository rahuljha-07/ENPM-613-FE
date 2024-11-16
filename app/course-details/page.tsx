"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { PaperAirplaneIcon, EyeIcon } from '@heroicons/react/24/solid'; // Added Icons
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion

const PUBLISHED_COURSES = `${process.env.NEXT_PUBLIC_ILIM_BE}/course/published`;
const DEFAULT_THUMBNAIL_URL = "https://as1.ftcdn.net/v2/jpg/05/79/68/24/1000_F_579682479_j4jRfx0nl3C8vMrTYVapFnGP8EgNHgfk.jpg";

// Dummy Data (if API fails)
const dummyCourses = [
  {
    id: '1',
    title: 'Introduction to Python',
    description: 'Learn the basics of Python programming.',
    instructor: 'Jane Doe',
    rating: '4.5',
    price: '49.99',
    modules: ['Variables', 'Loops', 'Functions'],
    thumbnailUrl: '',
    status: 'Published',
  },
  // Add more dummy courses as needed
];

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
      id,
      title,
      description,
      instructor,
      rating,
      price,
    }).toString();
    router.push(`/course-details/course/${id}?${query}`);
  };

  const handleViewClick = (course) => {
    const { id } = course;
    router.push(`/course-details/course/${id}`);
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 0px 8px rgb(255, 255, 255)",
      transition: {
        duration: 0.3,
        yoyo: Infinity,
      },
    },
  };

  const loaderVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: "linear",
      },
    },
  };

  return (
    <motion.div
      className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-start p-8 ml-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <motion.div
          className="w-full max-w-6xl bg-white text-gray-800 rounded-lg shadow-lg p-8"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Title */}
          <motion.div
            className="mb-8 text-center"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
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
                variants={loaderVariants}
                animate="animate"
              >
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12"></div>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      className="bg-white border rounded-lg p-4 items-start shadow hover:shadow-md transition-shadow duration-300 flex flex-col"
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
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
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold">{course.title}</h2>
                        <p className="text-gray-600 text-sm mt-2 mb-4">
                          {course.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{course.modules.length} Modules</span>
                          <span>💲 {course.price}</span>
                          {/* Removed Status Text */}
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <motion.div
                          whileHover="hover"
                          variants={buttonVariants}
                        >
                          <Button
                            variant="outline"
                            className="flex-1 flex items-center justify-center"
                            onClick={() => handleBuyClick(course)}
                          >
                            <PaperAirplaneIcon className="h-5 w-5 mr-2 transform rotate-45" />
                            Buy
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover="hover"
                          variants={buttonVariants}
                        >
                          <Button
                            variant="secondary"
                            className="flex-1 flex items-center justify-center"
                            onClick={() => handleViewClick(course)}
                          >
                            <EyeIcon className="h-5 w-5 mr-2" />
                            View
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.p
                    className="text-center text-gray-500 col-span-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
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
