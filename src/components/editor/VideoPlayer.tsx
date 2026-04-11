"use client";

import { useEffect, useRef } from "react";
import { formatTime, formatFileSize } from "@/lib/utils";
import type { VideoFile } from "@/types/editor";

interface VideoPlayerProps {
  video: VideoFile;
  onTimeUpdate?: (time: number) => void;
}

export default function VideoPlayer({ video, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = video.url;
      videoRef.current.load();
    }
  }, [video.url]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate?.(videoRef.current.currentTime);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative bg-black rounded-xl overflow-hidden aspect-video w-full">
        <video
          ref={videoRef}
          controls
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>{video.name}</span>
        <div className="flex items-center gap-3">
          <span>{video.width}&times;{video.height}</span>
          <span>{formatTime(video.duration)}</span>
          <span>{formatFileSize(video.size)}</span>
        </div>
      </div>
    </div>
  );
}
