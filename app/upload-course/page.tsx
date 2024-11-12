// app/upload-course/page.tsx
"use client"
import React, { useState } from 'react';

export default function UploadCoursePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [completionCriteria, setCompletionCriteria] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleThumbnailChange = (e) => {
    if (e.target.files.length > 0) {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeToTerms) {
      alert('Please agree to the terms of service');
      return;
    }

    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tags', tags);
      formData.append('completionCriteria', completionCriteria);
      formData.append('price', price);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      const response = await fetch('/api/upload-course', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Course created successfully!');
        // Clear form fields after successful upload
        setTitle('');
        setDescription('');
        setTags('');
        setCompletionCriteria('');
        setPrice('');
        setThumbnail(null);
        setAgreeToTerms(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to create course: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error uploading course:', error);
      alert('Error uploading course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex p-8">
      <div className="w-2/3 pr-8">
        <h1 className="text-3xl font-bold mb-6">Create a Course</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">Course Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Course Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 h-24"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block font-semibold mb-2">Completion Criteria</label>
              <input
                type="text"
                value={completionCriteria}
                onChange={(e) => setCompletionCriteria(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-2">Price in USD</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mr-2"
              required
            />
            <label>I agree to the terms of services (accessible here)</label>
          </div>
          <button type="submit" disabled={isSubmitting} className="bg-black text-white px-6 py-2 rounded-lg">
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>

      <div className="w-1/3 flex flex-col items-center">
        <label className="block font-semibold mb-2">Upload Thumbnail</label>
        <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
          {thumbnail ? (
            <img src={URL.createObjectURL(thumbnail)} alt="Thumbnail" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-gray-500">No Image</span>
          )}
        </div>
        <input type="file" onChange={handleThumbnailChange} accept="image/*" />
      </div>
    </div>
  );
}
