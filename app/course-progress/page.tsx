import React from 'react';
import { Progress } from '@/components/ui/progress';
import ModuleAccordion from './components/ModuleAccordion';

const CourseProgressPage = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Course Title and Progress */}
      <h1 className="text-2xl font-bold mb-2">How to learn Programming</h1>
      <p className="text-gray-500 text-sm mb-4">By: Ali Umair</p>
      
      <Progress value={25} className="my-2" /> {/* 25% course progress */}
      <p className="text-sm text-gray-700 mb-6">Progress: 25%</p>

      {/* Course Description */}
      <p className="text-gray-600 mb-6">
        This is the course description. Here, you can provide an overview of the course, covering the objectives, topics, and learning outcomes for students.
      </p>

      {/* Modules Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Modules</h2>
        <Accordion type="single" collapsible className="space-y-4">
          <ModuleAccordion title="Module 1" />
          <ModuleAccordion title="Module 2" />
          <ModuleAccordion title="Module 3" />
          <ModuleAccordion title="Module 4" />
        </Accordion>
      </div>
    </div>
  );
};

export default CourseProgressPage;
