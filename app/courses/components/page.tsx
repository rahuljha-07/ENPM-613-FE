import React from 'react';
import CourseCard from './components/CourseCard';

const courses = [
  { title: 'Course 1', modules: 10, quizzes: 32, reviews: 64, students: 120, price: 120, rating: 4.8 },
  { title: 'Course 2', modules: 21, quizzes: 14, reviews: 321, students: 4120, price: 180, rating: 4.0 },
  { title: 'Course 3', modules: 7, quizzes: 10, reviews: 3, students: 40, price: 80, rating: 3.3 },
];

const CoursesPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Courses</h1>

      {/* Search Bar */}
      <div className="flex items-center space-x-2 mb-6">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        />
        <button className="p-2 bg-gray-200 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8h13M3 16h13m5-8l-3 3m0 0l3 3m-3-3H9" />
          </svg>
        </button>
      </div>

      {/* Course List */}
      <div>
        {courses.map((course, index) => (
          <CourseCard key={index} {...course} />
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
