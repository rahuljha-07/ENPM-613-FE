import React from 'react';
import PurchasedCourseCard from './components/PurchasedCourseCard';

const purchasedCourses = [
  { title: 'How to learn Driving', instructor: 'Vivek', date: '04/11/2005', progress: 25, isCompleted: false },
  { title: 'How to learn Cooking', instructor: 'Rahul', date: '29/05/2022', progress: 100, isCompleted: true },
  { title: 'How to learn Driving', instructor: 'Vivek', date: '04/11/2005', progress: 15, isCompleted: false },
  { title: 'How to learn DJ Music', instructor: 'Pranav', date: '20/08/2011', progress: 15, isCompleted: false },
];

const PurchasedCoursesPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Purchased Courses</h1>
      <p className="text-lg font-semibold mb-6">Welcome Back!</p>

      <div className="space-y-4">
        {purchasedCourses.map((course, index) => (
          <PurchasedCourseCard key={index} {...course} />
        ))}
      </div>
    </div>
  );
};

export default PurchasedCoursesPage;
