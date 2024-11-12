import React from 'react';
import ApplicationCard from './components/ApplicationCard';

const applications = [
  { name: 'John Doe', title: 'Instructor of Mathematics' },
  { name: 'Jane Smith', title: 'Instructor of Science' },
  { name: 'Michael Brown', title: 'Instructor of History' },
  { name: 'Emily Davis', title: 'Instructor of English' },
];

const InstructorApplicationsPage = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Instructor Applications</h1>

      <div className="space-y-4">
        {applications.map((app, index) => (
          <ApplicationCard key={index} {...app} />
        ))}
      </div>
    </div>
  );
};

export default InstructorApplicationsPage;
