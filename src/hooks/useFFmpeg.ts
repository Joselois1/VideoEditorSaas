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

  // Mata el worker actual. Despues de llamar esto, la instancia es invalida y
  // hay que llamar load() de nuevo para poder ejecutar algo.
  const terminate = useCallback(() => {
    if (ffmpeg) {
      try { ffmpeg.terminate(); } catch { /* ignore */ }
    }
    setFFmpeg(null);
    setStatus("idle");
    setLoadProgress(0);
  }, [ffmpeg]);

  return {
    ffmpeg,
    status,
    loadProgress,
    load,
    terminate,
    isReady: status === "ready",
    isLoading: status === "loading",
    isError: status === "error",
  };
}
