"use client";

import { useState, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { loadFFmpeg } from "@/lib/ffmpeg/processor";

type FFmpegStatus = "idle" | "loading" | "ready" | "error";

export function useFFmpeg() {
  // Store the instance in state so consumers re-render when it becomes available.
  // A ref alone does not trigger re-renders, so ffmpeg would always be null.
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const [status, setStatus] = useState<FFmpegStatus>("idle");
  const [loadProgress, setLoadProgress] = useState(0);

  const load = useCallback(async () => {
    if (ffmpeg || status === "loading" || status === "ready") return;

    setStatus("loading");
    try {
      const instance = new FFmpeg();
      await loadFFmpeg(instance, setLoadProgress);
      setFFmpeg(instance);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [ffmpeg, status]);

  return {
    ffmpeg,
    status,
    loadProgress,
    load,
    isReady: status === "ready",
    isLoading: status === "loading",
  };
}
