"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

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

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  // Fetch modules function moved outside useEffect so it can be called elsewhere
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

  // Fetch modules on component mount and when courseId or BASE_URL changes
  useEffect(() => {
    if (courseId) {
      fetchModules();
    }
  }, [courseId, BASE_URL]);

  // Toggle expand/collapse for module description
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
        // Fetch the updated modules list
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
        // Fetch the updated modules list
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
                    {/* Uncomment or define handleAddItem if needed */}
                    {/* <button
                      onClick={(e) => { e.stopPropagation(); handleAddItem(module.id); }}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition duration-300"
                    >
                      Add Item
                    </button> */}
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
                    <p>{module.description}</p>
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
      </main>
    </div>
  );
}
