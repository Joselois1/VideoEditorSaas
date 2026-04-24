// ─── Project mode types ──────────────────────────────────────────────────────
// Modelo multi-clip con 2 tracks: video/fotos y musica.
// Cada Asset se sube una vez y puede instanciarse en la timeline como Clip.

export type AssetType = "video" | "image" | "audio";

export interface Asset {
  id: string;
  file: File;
  url: string;             // object URL para preview
  name: string;
  type: AssetType;
  size: number;            // bytes
  duration?: number;       // video/audio: segundos
  width?: number;          // video/image
  height?: number;
  thumbnailUrl?: string;   // video/image thumbnail (dataURL)
}

// Settings por clip de video/imagen (todas opcionales — default = sin efecto)
export interface ClipEffects {
  trim?: { start: number; end: number };     // solo video
  imageDuration?: number;                     // solo imagen: cuanto mostrarla (s)
  speed?: number;                              // 0.25..2
  rotation?: 0 | 90 | 180 | 270;
  flipH?: boolean;
  flipV?: boolean;
  brightness?: number;                         // -1..1
  contrast?: number;                           // 0..2
  saturation?: number;                         // 0..3
  fadeIn?: number;                             // segundos
  fadeOut?: number;
  volume?: number;                             // 0..2 (solo video)
  mute?: boolean;
}

export interface VideoClip {
  id: string;
  assetId: string;
  effects: ClipEffects;
}

export interface AudioClip {
  id: string;
  assetId: string;
  startAt: number;                             // posicion en la timeline (s)
  trim?: { start: number; end: number };
  volume: number;                              // 0..2
  fadeIn?: number;
  fadeOut?: number;
}

export type AspectPreset = "original" | "9:16" | "16:9" | "1:1" | "4:5";

export interface ProjectOutputSettings {
  aspect: AspectPreset;
  maxHeight: number;                           // 720, 1080, etc.
}

export interface Project {
  assets: Asset[];                             // biblioteca
  videoTrack: VideoClip[];                     // orden secuencial, back-to-back
  audioTrack: AudioClip[];                     // overlays sobre el video
  output: ProjectOutputSettings;
  selectedClipId: string | null;               // para abrir panel de efectos
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const IMAGE_DEFAULT_DURATION = 3;       // segundos por defecto para imagenes

export function makeAssetId() {
  return `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function makeClipId() {
  return `clip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getEffectiveDuration(clip: VideoClip, asset: Asset): number {
  if (asset.type === "image") {
    return clip.effects.imageDuration ?? IMAGE_DEFAULT_DURATION;
  }
  const raw = clip.effects.trim
    ? clip.effects.trim.end - clip.effects.trim.start
    : asset.duration ?? 0;
  const speed = clip.effects.speed ?? 1;
  return raw / speed;
}

export function getTimelineDuration(project: Project): number {
  return project.videoTrack.reduce((acc, clip) => {
    const asset = project.assets.find((a) => a.id === clip.assetId);
    if (!asset) return acc;
    return acc + getEffectiveDuration(clip, asset);
  }, 0);
}
