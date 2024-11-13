// pages/admin/get-all-courses.js
"use client";

import React, { useState } from 'react';

export default function GetAllCourses() {
  const [courses, setCourses] = useState([]);

  const fetchAllCourses = () => {
    // Replace with actual API call logic
    setCourses([
      { id: 1, title: "Intro to Programming", instructor: "John Doe" },
      { id: 2, title: "Advanced JavaScript", instructor: "Jane Smith" },
    ]);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center text-gray-800">
      <h2 className="text-4xl font-bold mb-6 text-blue-600 text-center">All Courses</h2>
      <button onClick={fetchAllCourses} className="px-4 py-2 rounded-md bg-blue-500 text-white mb-4">
        Fetch All Courses
      </button>
      <div className="mt-4 w-full max-w-md">
        {courses.map(course => (
          <div key={course.id} className="p-4 mb-2 bg-white rounded shadow text-gray-800">
            <p><strong>Title:</strong> {course.title}</p>
            <p><strong>Instructor:</strong> {course.instructor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
