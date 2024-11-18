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
    type: "MULTIPLE_CHOICE", // Changed from "TRUE_FALSE" to "MULTIPLE_CHOICE"
    points: 0,
    options: [],
  });
  const [newOptionText, setNewOptionText] = useState("");
  const [newOptionIsCorrect, setNewOptionIsCorrect] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editThumbnail, setEditThumbnail] = useState(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  // Duration formatter function
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? mins + " minute" + (mins > 1 ? "s " : " ") : ""}${secs} second${secs !== 1 ? "s" : ""}`;
  };

  // Fetch modules and course details
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

  // Toggle module expansion
  const toggleModuleExpansion = (moduleId) => {
    setExpandedModule((prev) => (prev === moduleId ? null : moduleId));
  };

  // Handle adding a new module
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

  // Handle deleting a module
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

  // Handle adding a video
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

  // Get video duration
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

  // Handle deleting a video
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

  // Handle adding a quiz
  const handleAddQuiz = (moduleId) => {
    setModuleIdForQuiz(moduleId);
    setIsAddQuizModalOpen(true);
    setQuizTitle("");
    setQuizDescription("");
    setPassingScore(0);
    setQuestions([]);
    setCurrentQuestion({
      text: "",
      type: "MULTIPLE_CHOICE", // Changed from "TRUE_FALSE" to "MULTIPLE_CHOICE"
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

  // Handle adding a question to the quiz
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
      type: "MULTIPLE_CHOICE",
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
    } else if (currentQuestion.type === 'MULTIPLE_CHOICE') {
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

  // Handle deleting a quiz
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

  const handleSubmitCourse = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (!token) {
      toast.error("Authentication token is missing.");
      return;
    }

    if (!courseId) {
      toast.error("Course ID is missing.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/instructor/course/${courseId}/submit-for-approval`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: null,
      });

      if (response.ok) {
        toast.success("Course submitted for approval successfully!");
        router.push('/manage-courses/course-management');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit the course.");
      }
    } catch (error) {
      console.error("Error submitting course:", error);
      toast.error("An error occurred while submitting the course.");
    }
  };

  const cancelDeleteQuiz = () => {
    setIsDeleteQuizModalOpen(false);
    setQuizToDelete(null);
  };

  const handleEditCourseSubmit = async (e) => {
    e.preventDefault();
    if (isUploadingThumbnail) return;

    setIsUploadingThumbnail(true);

    let thumbnailUrl = course.thumbnailUrl || '';

    if (editThumbnail) {
      try {
        const id = localStorage.getItem('id');
        const extension = editThumbnail.name.split('.').pop();
        const sanitizedTitle = editTitle.replace(/\s+/g, '-').toLowerCase();
        const fileName = `${id}-${sanitizedTitle}-thumbnail.${extension}`;

        thumbnailUrl = await uploadFileToS3(editThumbnail, fileName);
      } catch (error) {
        console.error('Error uploading thumbnail to S3:', error);
        toast.error('Failed to upload thumbnail');
        setIsUploadingThumbnail(false);
        return;
      }
    }

    const payload = {
      title: editTitle,
      description: editDescription,
      price: parseFloat(editPrice),
      thumbnailUrl,
    };

    try {
      const response = await fetch(`${BASE_URL}/instructor/update-course/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Course updated successfully!');
        setIsEditModalOpen(false);
        fetchModules();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update course: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('An error occurred while updating the course');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-800 z-10">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <Toaster />

        {/* Back Button */}
        <div className="flex justify-between items-center mb-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 font-semibold px-4 py-2 rounded-lg bg-transparent hover:bg-gray-100 transition duration-300"
            aria-label="Go back to previous page"
          >
            {/* Back Arrow Icon */}
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
          <div className="flex items-center space-x-4">
            {/* Edit Course Button */}
            <button
              onClick={() => {
                setIsEditModalOpen(true);
                setEditTitle(course.title || '');
                setEditDescription(course.description || '');
                setEditPrice(course.price || '');
                setEditThumbnail(null);
              }}
              className="flex items-center text-white bg-blue-500 hover:bg-blue-600 font-semibold px-4 py-2 rounded-lg transition duration-300"
              aria-label="Edit course"
            >
              {/* Optional Edit Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"  
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 11l6.768-6.768a2 2 0 1 1 2.828 2.828L11.828 13.828a2 2 0 0 1-1.414.586H9v-2.414a2 2 0 0 1 .586-1.414z"
                />
              </svg>

              Edit Course
            </button>
            <button
              onClick={handleSubmitCourse}
              className="flex items-center text-white bg-green-500 hover:bg-green-600 font-semibold px-4 py-2 rounded-lg transition duration-300"
              aria-label="Submit course for approval"
            >
              {/* Optional Submit Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Submit
            </button>
          </div>
        </div>

        {/* Modules Section */}
        <h2 className="text-2xl font-semibold mb-4">Modules</h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-dotted rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="border border-gray-300 rounded-lg p-4">
                {/* Module Header with Arrow Icon */}
                <div
                  className="flex justify-between items-center mb-2 cursor-pointer"
                  onClick={() => toggleModuleExpansion(module.id)}
                >
                  {/* Left Side: Arrow Icon + Module Title */}
                  <div className="flex items-center">
                    {/* Arrow Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 mr-2 transform transition-transform duration-300 ${
                        expandedModule === module.id ? 'rotate-90' : 'rotate-0'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {/* Module Title */}
                    <h3 className="font-semibold text-lg">{module.title}</h3>
                  </div>

                  {/* Right Side: Action Buttons */}
                  <div className="flex items-center space-x-4">
                    {/* Add Video Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddVideo(module.id);
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
                    >
                      Add Video
                    </button>
                    {/* Add Quiz Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddQuiz(module.id);
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
                    >
                      Add Quiz
                    </button>
                    {/* Delete Module Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module.id);
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Module Content (Description and Items) */}
                {expandedModule === module.id && (
                  <div className="pl-6 text-gray-600">
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
                                      Duration: {formatDuration(item.video.durationInSeconds)}
                                    </p>
                                  </div>
                                  <button
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
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
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
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

        {/* Add Module Button */}
        <button
          onClick={handleAddModule}
          className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
        >
          + Add Module
        </button>

        {/* Modal for Adding a Module */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Add New Module</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Module Title</label>
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter module title"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Module Description</label>
                <textarea
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-24"
                  placeholder="Enter module description"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitModule}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Confirming Module Deletion */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
              <p className="mb-4">Are you sure you want to delete this module?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelDeleteModule}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteModule}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Confirming Video Deletion */}
        {isDeleteVideoModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
              <p className="mb-4">Are you sure you want to delete this video?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelDeleteVideo}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteVideo}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Confirming Quiz Deletion */}
        {isDeleteQuizModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
              <p className="mb-4">Are you sure you want to delete this quiz?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelDeleteQuiz}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteQuiz}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Adding a Video */}
        {isAddVideoModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
              <h2 className="text-2xl font-bold mb-4">Add Video</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter video title"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-24"
                  placeholder="Enter video description"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Upload Video</label>
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
                  {/* Upload Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0122 8.618v6.764a2 2 0 01-2.447 1.902L15 14m0 0l-4.553 2.276A2 2 0 018 16.382V9.618a2 2 0 012.447-1.902L15 10z" />
                  </svg>
                  Select Video
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {videoFile && <p className="mt-2 text-sm text-gray-700">{videoFile.name}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Upload Transcript (.SRT format)</label>
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
                  {/* Transcript Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h4a2 2 0 012 2v2m-6-6h6m-6 4h6m-6-8h6m-6 4h6" />
                  </svg>
                  Select Transcript
                  <input
                    type="file"
                    accept=".srt"
                    onChange={(e) => setTranscriptFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {transcriptFile && <p className="mt-2 text-sm text-gray-700">{transcriptFile.name}</p>}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCloseAddVideoModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitVideo}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Submit'}
                </button>
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-40">
                  <div className="w-12 h-12 border-4 border-blue-600 border-dotted rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal for Adding a Quiz */}
        {isAddQuizModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">Add Quiz</h2>
              {/* Quiz Details */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Quiz Title</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter quiz title"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Quiz Description</label>
                <textarea
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-24"
                  placeholder="Enter quiz description"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Passing Score</label>
                <input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter passing score"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter question text"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-gray-700 mb-1">Question Type</label>
                  <select
                    value={currentQuestion.type}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter points for the question"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mr-2"
                        placeholder="Option text"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mr-2"
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
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 mt-2"
                      >
                        Add Option
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Quiz Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handleAddQuestion}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  Add Question
                </button>
                <div className="flex space-x-4">
                  <button
                    onClick={handleCloseAddQuizModal}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Course Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-4">Edit Course</h2>
              <form onSubmit={handleEditCourseSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700">Course Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter course title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter course description"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Price</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter price"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Thumbnail</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditThumbnail(e.target.files[0])}
                    className="block w-full text-gray-700 mt-2"
                  />
                  {editThumbnail && <p className="text-sm text-gray-500">{editThumbnail.name}</p>}
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                    disabled={isUploadingThumbnail}
                  >
                    {isUploadingThumbnail ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
