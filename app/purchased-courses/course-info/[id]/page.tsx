"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import { ChevronDownIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/solid';
import ReactPlayer from 'react-player';
import React from "react";

export default function CourseInfoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [currentTranscript, setCurrentTranscript] = useState(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState(null);
  const [currentVideoDescription, setCurrentVideoDescription] = useState(null);
  const [quizResponses, setQuizResponses] = useState({});
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuizItem, setCurrentQuizItem] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState({});
  const [courseProgress, setCourseProgress] = useState(null); // State for course progress

  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;

  const courseId = searchParams.get('courseId');

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

      if (!response.ok) {
        throw new Error('Failed to fetch course progress.');
      }

      const data = await response.json();
      setCourseProgress(data.body);
    } catch (error) {
      console.error('Error fetching course progress:', error);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchCourseProgress(); // Fetch course progress
    }
  }, [courseId]);

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const openVideoModal = (videoUrl, title, description, transcriptUrl) => {
    setCurrentVideoUrl(videoUrl);
    setCurrentVideoTitle(title);
    setCurrentVideoDescription(description);
    setIsVideoModalOpen(true);
    fetchTranscript(transcriptUrl);
  };

  const fetchTranscript = async (transcriptUrl) => {
    try {
      const response = await fetch(transcriptUrl);
      const text = await response.text();
      setCurrentTranscript(text);
    } catch (error) {
      console.error('Failed to fetch transcript:', error);
      setCurrentTranscript('Transcript not available.');
    }
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
    setQuizResponses({});
  };

  const closeQuizModal = () => {
    setIsQuizModalOpen(false);
    setCurrentQuizItem(null);
    setQuizResponses({});
  };

  const handleOptionSelect = (questionId, optionId, isMultipleChoice) => {
    setQuizResponses((prev) => {
      const prevResponses = prev[questionId] || [];
      if (isMultipleChoice) {
        if (prevResponses.includes(optionId)) {
          return { ...prev, [questionId]: prevResponses.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...prevResponses, optionId] };
        }
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const submitQuiz = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token not found. Please log in.');
      }

      const answers = Object.keys(quizResponses).map((questionId) => ({
        questionId,
        selectedOptionIds: quizResponses[questionId],
      }));

      const payload = {
        quizId: currentQuizItem.payload.id,
        answers,
      };

      const response = await fetch(`${BASE_URL}/student/attempt-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz.');
      }

      const data = await response.json();
      closeQuizModal();

      const { userScore, totalScore, passed } = data.body;

      alert(
        `Quiz submitted successfully! You scored ${userScore} out of ${totalScore}. You have ${
          passed ? 'passed' : 'failed'
        } the quiz.`
      );

      // Fetch the latest attempt to update the score display
      fetchQuizAttempt(currentQuizItem.payload.id);

      // Fetch course progress to update progress bar
      fetchCourseProgress();
    } catch (error) {
      console.error(error);
      alert('Error submitting quiz.');
    }
  };

  const viewCertificate = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token not found. Please log in.');
      }

      const response = await fetch(`${BASE_URL}/student/course/${courseId}/certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/pdf', // Set the correct content type for PDF
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch certificate.');
      }

      // Convert response to a blob (binary data for the PDF)
      const blob = await response.blob();

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Open the PDF in a new tab
      window.open(url, '_blank');

      alert('Certificate fetched successfully');
    } catch (error) {
      console.error('Error fetching certificate:', error);
      alert('Error fetching certificate.');
    }
  };

  // Format duration to "minutes and seconds" format
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
              <p className="text-gray-500 text-s">Created At: {new Date(course.createdAt).toLocaleString()}</p>
              <p className="text-gray-500 text-s">Updated At: {new Date(course.updatedAt).toLocaleString()}</p>
            </div>
            {course.thumbnailUrl && (
              <div className="flex flex-col items-center">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-48 h-32 object-cover rounded-lg shadow-md"
                />
                {courseProgress ? (
                  courseProgress.totalQuizzes === courseProgress.completedQuizzes ? (
                    <button
                      onClick={viewCertificate}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      View Certificate
                    </button>
                  ) : (
                    <div className="mt-4 w-full">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-500 h-4 rounded-full"
                          style={{
                            width: `${
                              (courseProgress.completedQuizzes / courseProgress.totalQuizzes) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Progress: {courseProgress.completedQuizzes} of {courseProgress.totalQuizzes}{' '}
                        quizzes completed
                      </p>
                    </div>
                  )
                ) : (
                  <div className="mt-4 w-full">
                    <p className="text-sm text-gray-600">Loading progress...</p>
                  </div>
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

        {isVideoModalOpen && currentVideoUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-2xl p-4">
              <button
                onClick={closeVideoModal}
                className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h2 className="text-2xl text-gray-600 font-bold mb-2">{currentVideoTitle}</h2>
              <p className="text-gray-600 mb-4">{currentVideoDescription}</p>
              <ReactPlayer url={currentVideoUrl} controls width="100%" height="100%" />
              {currentTranscript && (
                <div className="mt-4 bg-gray-200 p-4 rounded overflow-y-auto max-h-64">
                  <h4 className="font-semibold text-lg mb-2">Transcript</h4>
                  <p className="text-gray-700 whitespace-pre-line">{currentTranscript}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {isQuizModalOpen && currentQuizItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg shadow-lg overflow-y-auto w-full max-w-3xl max-h-full p-6">
              <button
                onClick={closeQuizModal}
                className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">{currentQuizItem.payload.title}</h3>
              <p className="text-gray-700 mb-4">{currentQuizItem.payload.description}</p>
              <div className="space-y-6">
                {currentQuizItem.payload.questions &&
                  currentQuizItem.payload.questions.map((question, qIndex) => (
                    <div key={question.id} className="border-b pb-4">
                      <p className="font-semibold text-gray-800 mb-2">
                        {qIndex + 1}. {question.text}
                        <span className="text-sm text-gray-600">
                          ({question.type === 'MULTIPLE_CHOICE' ? 'Multiple choice' : 'True/False'})
                        </span>
                      </p>
                      <div className="mt-2 space-y-2">
                        {question.options.map((option) => (
                          <div key={option.id} className="flex items-center">
                            <input
                              type={question.type === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                              name={`question-${question.id}`}
                              value={option.id}
                              checked={
                                Array.isArray(quizResponses[question.id]) &&
                                quizResponses[question.id].includes(option.id)
                              }
                              onChange={() =>
                                handleOptionSelect(
                                  question.id,
                                  option.id,
                                  question.type === 'MULTIPLE_CHOICE'
                                )
                              }
                              className="mr-2"
                            />
                            <label className="text-gray-800">{option.text}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
              <button
                onClick={submitQuiz}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
