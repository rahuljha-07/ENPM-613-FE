"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Correct imports for app directory
import Sidebar from '../../../components/Sidebar';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import ReactPlayer from 'react-player';

export default function CourseInfoPage() {
  const router = useRouter();
  const { id: courseId } = useParams(); // Use useParams to get courseId
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState(null);
  const [currentVideoDescription, setCurrentVideoDescription] = useState(null);
  const [currentTranscript, setCurrentTranscript] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuizItem, setCurrentQuizItem] = useState(null);

  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

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
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prevExpandedModules) => ({
      ...prevExpandedModules,
      [moduleId]: !prevExpandedModules[moduleId],
    }));
  };

  const openVideoModal = (videoUrl, title, description, transcriptUrl) => {
    setCurrentVideoUrl(videoUrl);
    setCurrentVideoTitle(title);
    setCurrentVideoDescription(description);
    setCurrentTranscript(transcriptUrl);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentVideoUrl(null);
    setCurrentVideoTitle(null);
    setCurrentVideoDescription(null);
    setCurrentTranscript(null);
  };

  const openQuizModal = (quizItem) => {
    setCurrentQuizItem(quizItem);
    setIsQuizModalOpen(true);
  };

  const closeQuizModal = () => {
    setIsQuizModalOpen(false);
    setCurrentQuizItem(null);
  };

  if (loading) {
    return <p>Loading course details...</p>;
  }

  if (!course) {
    return <p>Failed to load course details.</p>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8 pl-20 lg:pl-56 ml-16 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 font-semibold px-4 py-2 rounded-lg bg-white shadow-md transition duration-300"
          >
            {/* Back Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
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
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-48 h-32 object-cover rounded-lg shadow-md"
              />
            )}
          </div>

          <p className="text-gray-700 mb-8">{course.description || 'No description available.'}</p>

          <h2 className="text-xl font-semibold mb-4">Modules</h2>
          <div className="space-y-4">
            {course.courseModules && course.courseModules.length > 0 ? (
              course.courseModules.map((module) => (
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
                      {module.moduleItems.map((item) => (
                        <div key={item.id} className="p-4 bg-white shadow rounded-lg">
                          <h4 className="font-semibold">
                            {item.itemType === 'VIDEO' ? 'Video' : 'Quiz'} -{' '}
                            {item.itemType === 'VIDEO' ? item.video.title : item.quiz.title}
                          </h4>
                          {item.itemType === 'QUIZ' && (
                            <div>
                              <p className="text-gray-600 mt-2">
                                Number of Questions: {item.quiz.questions.length}
                              </p>
                              <button
                                onClick={() => openQuizModal(item)}
                                className="mt-2 text-blue-500 hover:underline"
                              >
                                View Quiz
                              </button>
                            </div>
                          )}
                          {item.itemType === 'VIDEO' && (
                            <div>
                              <p className="text-gray-600">{item.video.description}</p>
                              <p className="text-gray-500 text-sm mt-1">
                                Duration: {item.video.durationInSeconds} seconds
                              </p>
                              <button
                                onClick={() =>
                                  openVideoModal(
                                    item.video.videoUrl,
                                    item.video.title,
                                    item.video.description,
                                    item.video.transcriptUrl
                                  )
                                }
                                className="mt-2 text-blue-500 hover:underline"
                              >
                                Watch Video
                              </button>
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
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{currentVideoTitle}</h3>
              <button onClick={closeVideoModal} className="text-gray-600 hover:text-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ReactPlayer url={currentVideoUrl} controls width="100%" />
            <p className="mt-4 text-gray-700">{currentVideoDescription}</p>
            {currentTranscript && (
              <a
                href={currentTranscript}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline mt-2"
              >
                View Transcript
              </a>
            )}
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {isQuizModalOpen && currentQuizItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{currentQuizItem.quiz.title}</h3>
              <button onClick={closeQuizModal} className="text-gray-600 hover:text-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {currentQuizItem.quiz.questions.map((question, index) => (
              <div key={question.id} className="mb-6">
                <p className="font-semibold">
                  Question {index + 1}: {question.text}
                </p>
                {question.options.map((option) => (
                  <div key={option.id} className="ml-4">
                    <label className="inline-flex items-center">
                      <input
                        type={question.type === 'MULTIPLE_CHOICE' ? 'radio' : 'checkbox'}
                        name={`question-${index}`}
                        value={option.text}
                        disabled
                        className="form-radio"
                        checked={option.isCorrect}
                      />
                      <span className="ml-2">{option.text}</span>
                    </label>
                  </div>
                ))}
                <p className="text-green-600 mt-1">
                  Correct Answer(s):{' '}
                  {question.options
                    .filter((opt) => opt.isCorrect)
                    .map((opt) => opt.text)
                    .join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
