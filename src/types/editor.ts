export type ToolType =
  | "trim" | "speed" | "crop" | "audio" | "compress" | "format"
  | "rotate" | "color" | "reverse" | "volume" | "fade"
  | "loop" | "extract-frame" | "gif" | "fps" | "join" | "text" | "noise";

export type VideoFormat = "mp4" | "webm" | "mov" | "avi";
export type SpeedValue = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;
export type TextPosition =
  | "top-left" | "top-center" | "top-right"
  | "center"
  | "bottom-left" | "bottom-center" | "bottom-right";

// ─── Tool settings ────────────────────────────────────────────────────────────

export interface TrimSettings       { startTime: number; endTime: number }
export interface SpeedSettings      { value: SpeedValue }
export interface CropSettings       { x: number; y: number; width: number; height: number }
export interface AudioSettings      { mute: boolean; extractOnly: boolean }
export interface CompressSettings   { quality: "low" | "medium" | "high" }
export interface FormatSettings     { target: VideoFormat }
export interface RotateSettings     { angle: 0 | 90 | 180 | 270; flipH: boolean; flipV: boolean }
export interface ColorSettings      { brightness: number; contrast: number; saturation: number }
export interface ReverseSettings    { audio: boolean }
export interface VolumeSettings     { level: number }
export interface FadeSettings       { fadeIn: number; fadeOut: number }
export interface LoopSettings       { count: number }
export interface ExtractFrameSettings { time: number }
export interface GifSettings        { startTime: number; endTime: number; fps: number; width: number }
export interface FpsSettings        { fps: number }
export interface JoinSettings       { additionalFiles: File[] }
export interface TextSettings       {
  text: string;
  fontSize: number;
  color: string;
  position: TextPosition;
  startTime: number;
  endTime: number;
}
export interface NoiseSettings      { strength: number }

// ─── Video file ───────────────────────────────────────────────────────────────

export interface VideoFile {
  file: File;
  url: string;
  name: string;
  duration: number;
  width: number;
  height: number;
  size: number;
}

// ─── Editor state ─────────────────────────────────────────────────────────────

export interface EditorState {
  video: VideoFile | null;
  activeTool: ToolType | null;

  trim: TrimSettings;
  speed: SpeedSettings;
  crop: CropSettings | null;
  audio: AudioSettings;
  compress: CompressSettings;
  format: FormatSettings;
  rotate: RotateSettings;
  color: ColorSettings;
  reverse: ReverseSettings;
  volume: VolumeSettings;
  fade: FadeSettings;
  loop: LoopSettings;
  extractFrame: ExtractFrameSettings;
  gif: GifSettings;
  fps: FpsSettings;
  join: JoinSettings;
  text: TextSettings;
  noise: NoiseSettings;

  isProcessing: boolean;
  progress: number;
  outputUrl: string | null;
  outputIsImage: boolean;
  error: string | null;
}
