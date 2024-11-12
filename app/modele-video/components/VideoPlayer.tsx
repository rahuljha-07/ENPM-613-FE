import { Button } from '@/components/ui/button';
import { useState } from 'react';

const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // Here, add functionality to play or pause the video
  };

  return (
    <div className="relative w-full bg-black p-4 rounded-md overflow-hidden">
      {/* Video Element Placeholder */}
      <div className="w-full h-64 bg-gray-800 flex items-center justify-center text-white">
        <p>Video Player Placeholder</p>
      </div>

      {/* Custom Video Controls */}
      <div className="absolute bottom-4 left-4 flex space-x-2">
        <Button variant="outline" onClick={() => console.log("Rewind")}>⏪</Button>
        <Button variant="primary" onClick={togglePlay}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button variant="outline" onClick={() => console.log("Forward")}>⏩</Button>
      </div>
    </div>
  );
};

export default VideoPlayer;
