"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

export default function ModulePage() {
  const router = useRouter();
  const [modules, setModules] = useState([
    { id: 1, title: 'Module 1', content: 'Module 1 content goes here.', isOpen: false },
    { id: 2, title: 'Module 2', content: 'Module 2 content goes here.', isOpen: false },
    { id: 3, title: 'Module 3', content: 'Module 3 content goes here.', isOpen: false },
    { id: 4, title: 'Module 4', content: 'Module 4 content goes here.', isOpen: false },
  ]);
  const courseProgress = 25;

  const toggleModule = (id) => {
    setModules((prevModules) =>
      prevModules.map((module) =>
        module.id === id ? { ...module, isOpen: !module.isOpen } : module
      )
    );
  };

  return (
    <div className="flex p-6 bg-gray-100 min-h-screen">
      {/* Back Button */}
      <div className="fixed top-4 left-4">
        <Button onClick={() => router.back()} className="flex items-center space-x-2">
          <span className="text-gray-600">←</span>
          <span className="text-gray-600">Courses</span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2 text-center">How to learn Programming</h1>
        
        {/* Progress Bar */}
        <div className="text-center mb-4">
          <Progress value={courseProgress} className="w-full mb-2" />
          <span className="text-gray-500">Progress: {courseProgress}%</span>
        </div>

        {/* Instructor and Description */}
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-700">By: Ali Umair</p>
          <p className="text-gray-600 mt-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac lorem
            eget purus viverra scelerisque. Integer pretium nec justo nec volutpat.
          </p>
        </div>

        {/* Modules Section */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Modules</h2>
        <div className="space-y-4">
          {modules.map((module) => (
            <div key={module.id} className="border rounded-lg">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg focus:outline-none"
              >
                <span className="text-lg font-medium text-gray-800">{module.title}</span>
                {module.isOpen ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {module.isOpen && (
                <div className="p-4 text-gray-700">
                  <p>{module.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
