"use client";
import React, { useState } from "react";
import VideoPlayer from "./components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const ModuleVideoPage = () => {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div className="p-6">
      {/* Header Section */}
      <h1 className="text-2xl font-bold mb-4">How to learn Programming</h1>
      <p className="text-lg mb-4">Module 1</p>

      {/* Video Player */}
      <VideoPlayer />

      {/* Transcript and Bookmark Controls */}
      <div className="flex items-center justify-between mt-4">
        {/* Transcript Toggle */}
        <div className="flex items-center space-x-2">
          <p className="text-gray-700">Transcript</p>
          <Switch
            checked={showTranscript}
            onCheckedChange={setShowTranscript}
          />
        </div>

        {/* Bookmark Button */}
        <Button variant="outline">Bookmark</Button>
      </div>

      {/* Transcript Content */}
      {showTranscript && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <p className="text-sm text-gray-600">
            This is the transcript content. It will display the text of what is
            being spoken in the video, helping the user follow along or review
            key points.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="outline">Previous</Button>
        <Button variant="outline">Next</Button>
      </div>
    </div>
  );
};

export default ModuleVideoPage;
