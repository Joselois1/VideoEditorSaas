"use client";

import { useEffect, useRef } from "react";
import { formatTime, formatFileSize } from "@/lib/utils";
import type { VideoFile } from "@/types/editor";

interface VideoPlayerProps {
  video: VideoFile;
  previewUrl?: string | null;
  onTimeUpdate?: (time: number) => void;
}

export default function VideoPlayer({ video, previewUrl, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeUrl = previewUrl ?? video.url;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = activeUrl;
      videoRef.current.load();
    }
  }, [activeUrl]);

  return (
    <div className="flex flex-col gap-3">
      {previewUrl && (
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
          Vista previa del resultado — listo para descargar
        </div>
      )}

      <div className="relative bg-black rounded-xl overflow-hidden aspect-video w-full">
        <video
          ref={videoRef}
          controls
          className="w-full h-full object-contain"
          onTimeUpdate={() => {
            if (videoRef.current) onTimeUpdate?.(videoRef.current.currentTime);
          }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span className={previewUrl ? "text-green-500/70" : ""}>
          {previewUrl ? "resultado" : video.name}
        </span>
        <div className="flex items-center gap-3">
          <span>{video.width}&times;{video.height}</span>
          <span>{formatTime(video.duration)}</span>
          <span>{formatFileSize(video.size)}</span>
        </div>
      </div>
    </div>
  );
}
