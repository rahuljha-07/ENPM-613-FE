"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Updated import
import Sidebar from '../../../components/Sidebar';
import { ChevronDownIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/solid';
import ReactPlayer from 'react-player';

export default function CourseInfoPage() {
  const router = useRouter();
  const { id: courseId } = useParams(); // Use useParams to get courseId
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [currentTranscript, setCurrentTranscript] = useState(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState(null); // Store video title
  const [currentVideoDescription, setCurrentVideoDescription] = useState(null); // Store video description
  const [quizResponses, setQuizResponses] = useState({});
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuizItem, setCurrentQuizItem] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState({}); // Store latest quiz attempts by quiz ID
  const [courseProgress, setCourseProgress] = useState(null); // New state for course progress
  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

  const fetchCourseDetails = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token not found. Please log in.');
      }

      const response = await fetch(`${BASE_URL}/course/${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course details.');
      }

      const data = await response.json();
      setCourse(data.body);

      // Fetch course progress
      fetchCourseProgress();

      // Fetch the latest quiz attempt for each quiz in the course
      data.body.modules.forEach((module) => {
        module.items.forEach((item) => {
          if (item.itemType === 'QUIZ') {
            fetchQuizAttempt(item.payload.id); // Fetch latest attempt for each quiz
          }
        });
      });

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchCourseProgress = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token not found. Please log in.');
      }

      const response = await fetch(`${BASE_URL}/student/course/${courseId}/check-progress`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourseProgress(data.body);
      } else {
        console.error('Failed to fetch course progress.');
      }
    } catch (error) {
      console.error('Error fetching course progress:', error);
    }
  };

  const fetchQuizAttempt = async (quizId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token not found. Please log in.');
      }

      const response = await fetch(`${BASE_URL}/student/quiz-attempt/${quizId}/last`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.body) {
          setQuizAttempts((prev) => ({
            ...prev,
            [quizId]: data.body,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching quiz attempt:', error);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const viewCertificate = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token not found. Please log in.');
      }

      const response = await fetch(`${BASE_URL}/student/course/${courseId}/certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/pdf',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch certificate.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error fetching certificate:', error);
      alert('Error fetching certificate.');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? mins + ' minutes ' : ''}${secs} seconds`;
  };

  if (loading) {
    return <p>Loading course details...</p>;
  }

  if (!course) {
    return <p>Failed to load course details.</p>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <Sidebar />

      <div className="flex-1 p-8 ml-64">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 font-semibold px-4 py-2 rounded-lg bg-white shadow-md transition duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Courses
          </button>
        </div>

        <div className="bg-white text-gray-800 p-8 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-gray-500 text-s">
                Created At: {new Date(course.createdAt).toLocaleString()}
              </p>
              <p className="text-gray-500 text-s">
                Updated At: {new Date(course.updatedAt).toLocaleString()}
              </p>
            </div>
            {course.thumbnailUrl && (
              <div className="flex flex-col items-center">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-48 h-32 object-cover rounded-lg shadow-md"
                />
                {courseProgress && courseProgress.completedQuizzes !== courseProgress.totalQuizzes ? (
                  <div className="w-full mt-4">
                    <div className="bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-500 h-4 rounded-full"
                        style={{ width: `${(courseProgress.completedQuizzes / courseProgress.totalQuizzes) * 100}%` }}
                      />
                    </div>
                    <p className="text-gray-500 text-sm mt-2 text-center">
                      {courseProgress.completedQuizzes} / {courseProgress.totalQuizzes} Quizzes Completed
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={viewCertificate}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    View Certificate
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="text-gray-700 mb-8">{course.description || 'No description available.'}</p>

          <h2 className="text-xl font-semibold mb-4">Modules</h2>
          <div className="space-y-4">
            {course.modules && course.modules.length > 0 ? (
              course.modules.map((module) => (
                <div key={module.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleModule(module.id)}
                  >
                    <h3 className="font-semibold text-lg">{module.title}</h3>
                    {expandedModules[module.id] ? (
                      <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  {expandedModules[module.id] && (
                    <div className="mt-4 space-y-2">
                      <p className="text-gray-600 mb-4">{module.description}</p>
                      {module.items.map((item) => (
                        <div key={item.id} className="p-4 bg-white shadow rounded-lg">
                          <h4 className="font-semibold">
                            {item.itemType === 'VIDEO' ? 'Video' : 'Quiz'} - {item.payload.title}
                          </h4>
                          {item.itemType === 'QUIZ' && (
                            <div>
                              {quizAttempts[item.payload.id] ? (
                                <p className="text-gray-600 mt-2">
                                  Your Score: {quizAttempts[item.payload.id].userScore} /{' '}
                                  {quizAttempts[item.payload.id].totalScore}
                                </p>
                              ) : (
                                <p className="text-gray-600 mt-2">No attempts yet</p>
                              )}
                              <button
                                onClick={() => openQuizModal(item)}
                                className="text-blue-500 hover:underline"
                              >
                                Take Quiz
                              </button>
                            </div>
                          )}
                          {item.itemType === 'VIDEO' && (
                            <div>
                              <p className="text-gray-600">{item.payload.description}</p>
                              <button
                                onClick={() =>
                                  openVideoModal(
                                    item.payload.videoUrl,
                                    item.payload.title,
                                    item.payload.description,
                                    item.payload.transcriptUrl
                                  )
                                }
                                className="text-blue-500 hover:underline"
                              >
                                Watch Video
                              </button>
                              <p className="text-gray-500 text-sm mt-1">
                                Duration: {formatDuration(item.payload.durationInSeconds)}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No modules available for this course.</p>
            )}
          </div>
        </div>

        {/* Video Modal and Quiz Modal code remains unchanged */}
      </div>
    </div>
  );
}
