"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import { uploadFileToS3 } from '../../../lib/s3';

export default function EditCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [expandedModule, setExpandedModule] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [transcriptFile, setTranscriptFile] = useState(null);
  const [moduleIdForVideo, setModuleIdForVideo] = useState(null);
  const [moduleIdForQuiz, setModuleIdForQuiz] = useState(null);

  const [isUploading, setIsUploading] = useState(false);

  const [isDeleteVideoModalOpen, setIsDeleteVideoModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);

  const [isDeleteQuizModalOpen, setIsDeleteQuizModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [passingScore, setPassingScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    type: "TRUE_FALSE",
    points: 0,
    options: [],
  });
  const [newOptionText, setNewOptionText] = useState("");
  const [newOptionIsCorrect, setNewOptionIsCorrect] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const fetchModules = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/course/${courseId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCourse(data.body);
        setModules(data.body.courseModules || []);
      } else {
        toast.error("Failed to load modules");
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast.error("An error occurred while fetching modules");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchModules();
    }
  }, [courseId, BASE_URL]);

  const toggleModuleExpansion = (moduleId) => {
    setExpandedModule((prev) => (prev === moduleId ? null : moduleId));
  };

  const handleAddModule = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModuleTitle("");
    setModuleDescription("");
  };

  const handleSubmitModule = async () => {
    if (!moduleTitle || !moduleDescription) {
      toast.error("Title and description are required");
      return;
    }

    const payload = {
      title: moduleTitle,
      description: moduleDescription,
      orderIndex: modules.length,
    };

    try {
      const response = await fetch(`${BASE_URL}/instructor/course/${courseId}/add-module`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Module added successfully!");
        handleCloseModal();
        fetchModules();
      } else {
        toast.error("Failed to add module");
      }
    } catch (error) {
      console.error("Error adding module:", error);
      toast.error("An error occurred while adding the module");
    }
  };

  const handleDeleteModule = (moduleId) => {
    setModuleToDelete(moduleId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteModule = async () => {
    if (!moduleToDelete) return;

    try {
      const response = await fetch(`${BASE_URL}/instructor/delete-module/${moduleToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Module deleted successfully!");
        setIsDeleteModalOpen(false);
        setModuleToDelete(null);
        fetchModules();
      } else {
        toast.error("Failed to delete module");
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("An error occurred while deleting the module");
    }
  };

  const cancelDeleteModule = () => {
    setIsDeleteModalOpen(false);
    setModuleToDelete(null);
  };

  const handleAddVideo = (moduleId) => {
    setModuleIdForVideo(moduleId);
    setIsAddVideoModalOpen(true);
  };

  const handleCloseAddVideoModal = () => {
    setIsAddVideoModalOpen(false);
    setVideoTitle("");
    setVideoDescription("");
    setVideoFile(null);
    setTranscriptFile(null);
    setModuleIdForVideo(null);
  };

  const getVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        resolve(Math.floor(duration));
      };

      video.onerror = function () {
        reject("Error loading video");
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleSubmitVideo = async () => {
    if (!videoTitle || !videoDescription || !videoFile || !transcriptFile) {
      toast.error("All fields are required");
      return;
    }

    setIsUploading(true);

    try {
      const videofilename = `${courseId}-${moduleIdForVideo}-video-${videoFile.name}`;
      const transcriptFilename = `${courseId}-${moduleIdForVideo}-transcript-${transcriptFile.name}`;

      const videoUrl = await uploadFileToS3(videoFile, videofilename);
      const transcriptUrl = await uploadFileToS3(transcriptFile, transcriptFilename);

      const durationInSeconds = await getVideoDuration(videoFile);

      const payload = {
        title: videoTitle,
        description: videoDescription,
        videoUrl,
        durationInSeconds,
        transcriptUrl,
      };

      const response = await fetch(`${BASE_URL}/instructor/module/${moduleIdForVideo}/add-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Video added successfully!");
        handleCloseAddVideoModal();
        fetchModules();
      } else {
        toast.error("Failed to add video");
      }
    } catch (error) {
      console.error("Error adding video:", error);
      toast.error("An error occurred while adding the video");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = (videoId) => {
    setVideoToDelete(videoId);
    setIsDeleteVideoModalOpen(true);
  };

  const confirmDeleteVideo = async () => {
    if (!videoToDelete) return;

    try {
      const response = await fetch(`${BASE_URL}/instructor/delete-video/${videoToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Video deleted successfully!");
        setIsDeleteVideoModalOpen(false);
        setVideoToDelete(null);
        fetchModules();
      } else {
        toast.error("Failed to delete video");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("An error occurred while deleting the video");
    }
  };

  const cancelDeleteVideo = () => {
    setIsDeleteVideoModalOpen(false);
    setVideoToDelete(null);
  };

  const handleAddQuiz = (moduleId) => {
    setModuleIdForQuiz(moduleId);
    setIsAddQuizModalOpen(true);
    setQuizTitle("");
    setQuizDescription("");
    setPassingScore(0);
    setQuestions([]);
    setCurrentQuestion({
      text: "",
      type: "TRUE_FALSE",
      points: 0,
      options: [],
    });
    setNewOptionText("");
    setNewOptionIsCorrect(false);
  };

  const handleCloseAddQuizModal = () => {
    setIsAddQuizModalOpen(false);
    setModuleIdForQuiz(null);
  };

  const handleAddQuestion = () => {
    if (
      !currentQuestion.text ||
      currentQuestion.points <= 0 ||
      currentQuestion.options.length === 0 ||
      !currentQuestion.options.some((opt) => opt.isCorrect)
    ) {
      toast.error("Please complete the current question before adding a new one");
      return;
    }
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({
      text: "",
      type: "TRUE_FALSE",
      points: 0,
      options: [],
    });
    setNewOptionText("");
    setNewOptionIsCorrect(false);
  };

  const handleAddOption = (optionText, isCorrect) => {
    setCurrentQuestion((prevQuestion) => ({
      ...prevQuestion,
      options: [...prevQuestion.options, { text: optionText, isCorrect }],
    }));
  };

  const handleOptionChange = (optionIndex, isCorrect) => {
    setCurrentQuestion((prevQuestion) => ({
      ...prevQuestion,
      options: prevQuestion.options.map((opt, idx) => {
        if (idx === optionIndex) {
          return { ...opt, isCorrect };
        } else if (currentQuestion.type === 'TRUE_FALSE') {
          return { ...opt, isCorrect: false };
        } else {
          return opt;
        }
      }),
    }));
  };

  useEffect(() => {
    if (currentQuestion.type === 'TRUE_FALSE') {
      setCurrentQuestion((prevQuestion) => ({
        ...prevQuestion,
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: false },
        ],
      }));
    } else {
      setCurrentQuestion((prevQuestion) => ({
        ...prevQuestion,
        options: [],
      }));
    }
    setNewOptionText("");
    setNewOptionIsCorrect(false);
  }, [currentQuestion.type]);

  const handleSubmitQuiz = async () => {
    if (!quizTitle || !quizDescription || passingScore <= 0 || questions.length === 0) {
      toast.error("Please complete all quiz fields");
      return;
    }

    const payload = {
      title: quizTitle,
      description: quizDescription,
      passingScore,
      questions,
    };

    try {
      const response = await fetch(`${BASE_URL}/instructor/module/${moduleIdForQuiz}/add-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Quiz added successfully!");
        handleCloseAddQuizModal();
        fetchModules();
      } else {
        toast.error("Failed to add quiz");
      }
    } catch (error) {
      console.error("Error adding quiz:", error);
      toast.error("An error occurred while adding the quiz");
    }
  };

  const handleDeleteQuiz = (quizId) => {
    setQuizToDelete(quizId);
    setIsDeleteQuizModalOpen(true);
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;

    try {
      const response = await fetch(`${BASE_URL}/instructor/delete-quiz/${quizToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Quiz deleted successfully!");
        setIsDeleteQuizModalOpen(false);
        setQuizToDelete(null);
        fetchModules();
      } else {
        toast.error("Failed to delete quiz");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("An error occurred while deleting the quiz");
    }
  };

  const cancelDeleteQuiz = () => {
    setIsDeleteQuizModalOpen(false);
    setQuizToDelete(null);
  };

  return (
    <div className="flex">
      <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-800 z-10">
        <Sidebar />
      </aside>

      <main className="flex-1 ml-64 p-8">
        <Toaster />
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 font-semibold"
          >
            ← Back
          </button>
          <button className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800">
            Edit Course Information
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-4">Edit Course</h1>
        {course && <h2 className="text-xl font-semibold mb-4">{course.title}</h2>}

        <h2 className="text-xl font-semibold mb-4">Modules</h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-dotted rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="border border-gray-300 rounded-lg p-4">
                <div
                  className="flex justify-between items-center mb-2 cursor-pointer"
                  onClick={() => toggleModuleExpansion(module.id)}
                >
                  <h3 className="font-semibold text-lg">{module.title}</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddVideo(module.id);
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-300"
                    >
                      Add Video
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddQuiz(module.id);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition duration-300"
                    >
                      Add Quiz
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module.id);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {expandedModule === module.id && (
                  <div className="pl-4 text-gray-600">
                    <p className="mb-4">{module.description}</p>
                    {module.moduleItems && module.moduleItems.length > 0 ? (
                      <div className="space-y-2">
                        {module.moduleItems.map((item) => (
                          <div
                            key={item.id}
                            className="border border-gray-200 rounded-md p-3 bg-gray-50"
                          >
                            {item.itemType === 'VIDEO' && item.video && (
                              <div>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="font-semibold text-md">{item.video.title}</h4>
                                    <p className="text-sm">{item.video.description}</p>
                                    <p className="text-sm text-gray-500">
                                      Duration: {item.video.durationInSeconds} seconds
                                    </p>
                                  </div>
                                  <button
                                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-300"
                                    onClick={() => handleDeleteVideo(item.video.id)}
                                  >
                                    Delete Video
                                  </button>
                                </div>
                              </div>
                            )}
                            {item.itemType === 'QUIZ' && item.quiz && (
                              <div>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="font-semibold text-md">{item.quiz.title}</h4>
                                    <p className="text-sm">{item.quiz.description}</p>
                                    <p className="text-sm text-gray-500">
                                      Passing Score: {item.quiz.passingScore}
                                    </p>
                                  </div>
                                  <button
                                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-300"
                                    onClick={() => handleDeleteQuiz(item.quiz.id)}
                                  >
                                    Delete Quiz
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No items in this module yet.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleAddModule}
          className="text-blue-500 mt-4 hover:text-blue-700 font-semibold"
        >
          + Add Module
        </button>

        {/* Modal for adding a module */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Add New Module</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Module Title</label>
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Module Description</label>
                <textarea
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 h-24"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitModule}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for confirming module deletion */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
              <p className="mb-4">Are you sure you want to delete this module?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelDeleteModule}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteModule}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for confirming video deletion */}
        {isDeleteVideoModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
              <p className="mb-4">Are you sure you want to delete this video?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelDeleteVideo}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteVideo}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for confirming quiz deletion */}
        {isDeleteQuizModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
              <p className="mb-4">Are you sure you want to delete this quiz?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelDeleteQuiz}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteQuiz}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for adding a video */}
        {isAddVideoModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
              <h2 className="text-2xl font-bold mb-4">Add Video</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 h-24"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Upload Video</label>
                <label className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer">
                  Select Video
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {videoFile && <p className="mt-2">{videoFile.name}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Upload Transcript (.SRT format)</label>
                <label className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer">
                  Select Transcript
                  <input
                    type="file"
                    accept=".srt"
                    onChange={(e) => setTranscriptFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {transcriptFile && <p className="mt-2">{transcriptFile.name}</p>}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCloseAddVideoModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitVideo}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Submit'}
                </button>
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-30">
                  <div className="w-12 h-12 border-4 border-blue-600 border-dotted rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal for adding a quiz */}
        {isAddQuizModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">Add Quiz</h2>
              {/* Quiz Details */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Quiz Title</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Quiz Description</label>
                <textarea
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 h-24"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Passing Score</label>
                <input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              {/* Questions List */}
              {questions.map((question, index) => (
                <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold">Question {index + 1}</h4>
                  <p>{question.text}</p>
                  <p>Type: {question.type}</p>
                  <p>Points: {question.points}</p>
                  <ul className="list-disc pl-5">
                    {question.options.map((option, idx) => (
                      <li key={idx}>
                        {option.text} {option.isCorrect && "(Correct)"}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Add New Question */}
              <div className="border border-gray-300 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">Add Question</h4>
                <div className="mb-2">
                  <label className="block text-gray-700 mb-1">Question Text</label>
                  <input
                    type="text"
                    value={currentQuestion.text}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, text: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-gray-700 mb-1">Question Type</label>
                  <select
                    value={currentQuestion.type}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, type: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2"
                  >
                    <option value="TRUE_FALSE">True/False</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-gray-700 mb-1">Points</label>
                  <input
                    type="number"
                    value={currentQuestion.points}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        points: parseInt(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>

                {/* Options */}
                <div className="mb-2">
                  <label className="block text-gray-700 mb-1">Options</label>
                  {currentQuestion.options.map((option, idx) => (
                    <div key={idx} className="flex items-center mb-1">
                      <input
                        type="text"
                        value={option.text}
                        readOnly
                        className="w-full border border-gray-300 rounded-lg p-2 mr-2"
                      />
                      <label className="flex items-center">
                        <input
                          type={currentQuestion.type === 'TRUE_FALSE' ? 'radio' : 'checkbox'}
                          name={currentQuestion.type === 'TRUE_FALSE' ? 'tfOption' : undefined}
                          checked={option.isCorrect}
                          onChange={() => handleOptionChange(idx, !option.isCorrect)}
                          className="mr-1"
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                  {/* Add Option (only for Multiple Choice) */}
                  {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                    <>
                      <div className="flex items-center mb-1">
                        <input
                          type="text"
                          placeholder="Option Text"
                          value={newOptionText}
                          onChange={(e) => setNewOptionText(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 mr-2"
                        />
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newOptionIsCorrect}
                            onChange={(e) => setNewOptionIsCorrect(e.target.checked)}
                            className="mr-1"
                          />
                          Correct
                        </label>
                      </div>
                      <button
                        onClick={() => {
                          if (!newOptionText) {
                            toast.error("Option text cannot be empty");
                            return;
                          }
                          handleAddOption(newOptionText, newOptionIsCorrect);
                          setNewOptionText("");
                          setNewOptionIsCorrect(false);
                        }}
                        className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-300 mt-2"
                      >
                        Add Option
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleAddQuestion}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Add Question
                </button>
                <div className="flex space-x-4">
                  <button
                    onClick={handleCloseAddQuizModal}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
