import type { Asset, AssetType } from "@/types/project";
import { makeAssetId } from "@/types/project";
import { getVideoDimensions } from "@/lib/utils";

export const VIDEO_MIME = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/mpeg"];
export const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const AUDIO_MIME = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/aac", "audio/mp4", "audio/x-m4a"];

export function classifyFile(file: File): AssetType | null {
  if (VIDEO_MIME.includes(file.type)) return "video";
  if (IMAGE_MIME.includes(file.type)) return "image";
  if (AUDIO_MIME.includes(file.type)) return "audio";
  // fallback by extension for files with empty mime (common on some OS)
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (["mp4", "webm", "mov", "avi", "mpeg", "mpg"].includes(ext)) return "video";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
  if (["mp3", "wav", "ogg", "aac", "m4a"].includes(ext)) return "audio";
  return null;
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(url);
    };
    audio.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    audio.src = url;
  });
}

// Genera un thumbnail (dataURL) para preview rapido en la biblioteca.
async function makeVideoThumbnail(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.crossOrigin = "anonymous";
    video.src = url;
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.5, video.duration / 2);
    };
    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        const targetW = 160;
        const ratio = video.videoWidth > 0 ? video.videoHeight / video.videoWidth : 0.5625;
        canvas.width = targetW;
        canvas.height = Math.round(targetW * ratio);
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        resolve(undefined);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
  });
}

async function makeImageThumbnail(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const targetW = 160;
        const ratio = img.naturalHeight / img.naturalWidth;
        canvas.width = targetW;
        canvas.height = Math.round(targetW * ratio);
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        resolve(undefined);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
    img.src = url;
  });
}

export async function buildAsset(file: File): Promise<Asset> {
  const type = classifyFile(file);
  if (!type) throw new Error(`Formato no soportado: ${file.name}`);

  const base: Asset = {
    id: makeAssetId(),
    file,
    url: URL.createObjectURL(file),
    name: file.name,
    type,
    size: file.size,
  };

  if (type === "video") {
    const { width, height, duration } = await getVideoDimensions(file);
    base.width = width;
    base.height = height;
    base.duration = duration;
    base.thumbnailUrl = await makeVideoThumbnail(file);
  } else if (type === "image") {
    const { width, height } = await getImageDimensions(file);
    base.width = width;
    base.height = height;
    base.thumbnailUrl = await makeImageThumbnail(file);
  } else if (type === "audio") {
    base.duration = await getAudioDuration(file);
  }

  return base;
}
