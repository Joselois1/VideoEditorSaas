"use client";

import { useState, useCallback } from "react";
import type { EditorState, ToolType, VideoFile, CropSettings } from "@/types/editor";
import { getVideoDimensions } from "@/lib/utils";

const initialState: EditorState = {
  video: null,
  activeTool: null,

  trim:         { startTime: 0, endTime: 0 },
  speed:        { value: 1 },
  crop:         null,
  audio:        { mute: false, extractOnly: false },
  compress:     { quality: "medium" },
  format:       { target: "mp4" },
  rotate:       { angle: 0, flipH: false, flipV: false },
  color:        { brightness: 0, contrast: 1, saturation: 1 },
  reverse:      { audio: true },
  volume:       { level: 1 },
  fade:         { fadeIn: 0, fadeOut: 0 },
  loop:         { count: 2 },
  extractFrame: { time: 0 },
  gif:          { startTime: 0, endTime: 5, fps: 10, width: 480 },
  fps:          { fps: 30 },
  join:         { additionalFiles: [] },
  text:         { text: "", fontSize: 36, color: "white", position: "bottom-center", startTime: 0, endTime: 0 },
  noise:        { strength: 25 },

  isProcessing:  false,
  progress:      0,
  outputUrl:     null,
  outputIsImage: false,
  error:         null,
};

export function useVideoEditor() {
  const [state, setState] = useState<EditorState>(initialState);

  const loadVideo = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    try {
      const { width, height, duration } = await getVideoDimensions(file);
      const video: VideoFile = { file, url, name: file.name, duration, width, height, size: file.size };
      setState((prev) => ({
        ...prev,
        video,
        trim:         { startTime: 0, endTime: duration },
        extractFrame: { time: Math.floor(duration / 2) },
        gif:          { startTime: 0, endTime: Math.min(duration, 5), fps: 10, width: 480 },
        text:         { ...prev.text, endTime: duration },
        outputUrl:    null,
        outputIsImage: false,
        error:        null,
        activeTool:   "trim",
      }));
    } catch {
      URL.revokeObjectURL(url);
      setState((prev) => ({ ...prev, error: "No se pudo cargar el video." }));
    }
  }, []);

  const setActiveTool = useCallback((tool: ToolType) => {
    setState((prev) => ({
      ...prev,
      activeTool: tool,
      outputUrl: null,
      outputIsImage: false,
      crop:
        tool === "crop" && prev.crop === null && prev.video
          ? { x: 0, y: 0, width: prev.video.width, height: prev.video.height }
          : prev.crop,
    }));
  }, []);

  const updateTrim    = useCallback((s: number, e: number) =>
    setState((p) => ({ ...p, trim: { startTime: s, endTime: e } })), []);

  const updateSpeed   = useCallback((value: EditorState["speed"]["value"]) =>
    setState((p) => ({ ...p, speed: { value } })), []);

  const updateCrop    = useCallback((crop: CropSettings) =>
    setState((p) => ({ ...p, crop })), []);

  const updateAudio   = useCallback((audio: Partial<EditorState["audio"]>) =>
    setState((p) => ({ ...p, audio: { ...p.audio, ...audio } })), []);

  const updateCompress = useCallback((quality: EditorState["compress"]["quality"]) =>
    setState((p) => ({ ...p, compress: { quality } })), []);

  const updateFormat  = useCallback((target: EditorState["format"]["target"]) =>
    setState((p) => ({ ...p, format: { target } })), []);

  const updateRotate  = useCallback((rotate: Partial<EditorState["rotate"]>) =>
    setState((p) => ({ ...p, rotate: { ...p.rotate, ...rotate } })), []);

  const updateColor   = useCallback((color: Partial<EditorState["color"]>) =>
    setState((p) => ({ ...p, color: { ...p.color, ...color } })), []);

  const updateReverse = useCallback((reverse: Partial<EditorState["reverse"]>) =>
    setState((p) => ({ ...p, reverse: { ...p.reverse, ...reverse } })), []);

  const updateVolume  = useCallback((level: number) =>
    setState((p) => ({ ...p, volume: { level } })), []);

  const updateFade    = useCallback((fade: Partial<EditorState["fade"]>) =>
    setState((p) => ({ ...p, fade: { ...p.fade, ...fade } })), []);

  const updateLoop    = useCallback((count: number) =>
    setState((p) => ({ ...p, loop: { count } })), []);

  const updateExtractFrame = useCallback((time: number) =>
    setState((p) => ({ ...p, extractFrame: { time } })), []);

  const updateGif     = useCallback((gif: Partial<EditorState["gif"]>) =>
    setState((p) => ({ ...p, gif: { ...p.gif, ...gif } })), []);

  const updateFps     = useCallback((fps: number) =>
    setState((p) => ({ ...p, fps: { fps } })), []);

  const updateJoin    = useCallback((additionalFiles: File[]) =>
    setState((p) => ({ ...p, join: { additionalFiles } })), []);

  const updateText    = useCallback((text: Partial<EditorState["text"]>) =>
    setState((p) => ({ ...p, text: { ...p.text, ...text } })), []);

  const updateNoise   = useCallback((strength: number) =>
    setState((p) => ({ ...p, noise: { strength } })), []);

  const setProcessing = useCallback((isProcessing: boolean, progress = 0) =>
    setState((p) => ({ ...p, isProcessing, progress })), []);

  const setOutputUrl  = useCallback((outputUrl: string, outputIsImage = false) =>
    setState((p) => ({ ...p, outputUrl, outputIsImage, isProcessing: false, progress: 100 })), []);

  const setError      = useCallback((error: string) =>
    setState((p) => ({ ...p, error, isProcessing: false })), []);

  const reset         = useCallback(() => {
    if (state.video?.url)  URL.revokeObjectURL(state.video.url);
    if (state.outputUrl)   URL.revokeObjectURL(state.outputUrl);
    setState(initialState);
  }, [state.video?.url, state.outputUrl]);

  return {
    state,
    loadVideo, setActiveTool,
    updateTrim, updateSpeed, updateCrop, updateAudio, updateCompress, updateFormat,
    updateRotate, updateColor, updateReverse, updateVolume, updateFade, updateLoop,
    updateExtractFrame, updateGif, updateFps, updateJoin, updateText, updateNoise,
    setProcessing, setOutputUrl, setError, reset,
  };
}
