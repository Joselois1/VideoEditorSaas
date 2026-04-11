"use client";

import { useRef } from "react";
import { formatFileSize } from "@/lib/utils";
import type { JoinClip } from "@/types/editor";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/mpeg"]);
const ACCEPT = [...IMAGE_TYPES, ...VIDEO_TYPES].join(",");

function isImageFile(file: File) {
  return IMAGE_TYPES.has(file.type);
}

interface Props {
  originalName: string;
  clips: JoinClip[];
  onChange: (clips: JoinClip[]) => void;
}

export default function JoinPanel({ originalName, clips, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newClips: JoinClip[] = Array.from(fileList).map((file) => ({
      file,
      isImage: isImageFile(file),
      duration: 3,
    }));
    onChange([...clips, ...newClips]);
  };

  const remove = (idx: number) =>
    onChange(clips.filter((_, i) => i !== idx));

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...clips];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveDown = (idx: number) => {
    if (idx === clips.length - 1) return;
    const next = [...clips];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  const setDuration = (idx: number, duration: number) => {
    const next = [...clips];
    next[idx] = { ...next[idx], duration };
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">
        Combina videos e imagenes en un solo archivo. Las imagenes se muestran durante el tiempo que configures.
      </p>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-zinc-500 mb-1">Orden de los clips</p>

        {/* Original — siempre primero, no se puede mover */}
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/80 rounded-lg">
          <span className="text-[10px] text-zinc-600 w-4">1</span>
          <span className="text-xs bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded font-medium">VIDEO</span>
          <span className="text-xs text-zinc-300 flex-1 truncate">{originalName}</span>
          <span className="text-[10px] text-violet-400">original</span>
        </div>

        {clips.map((clip, idx) => (
          <div key={idx} className="flex flex-col gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-600 w-4">{idx + 2}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${clip.isImage ? "bg-blue-900/60 text-blue-300" : "bg-zinc-700 text-zinc-300"}`}>
                {clip.isImage ? "IMAGEN" : "VIDEO"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 truncate">{clip.file.name}</p>
                <p className="text-[10px] text-zinc-600">{formatFileSize(clip.file.size)}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => moveUp(idx)} disabled={idx === 0}
                  className="text-zinc-500 hover:text-zinc-200 disabled:opacity-30 text-xs w-5 text-center">↑</button>
                <button onClick={() => moveDown(idx)} disabled={idx === clips.length - 1}
                  className="text-zinc-500 hover:text-zinc-200 disabled:opacity-30 text-xs w-5 text-center">↓</button>
                <button onClick={() => remove(idx)}
                  className="text-zinc-600 hover:text-red-400 transition-colors text-xs w-5 text-center">✕</button>
              </div>
            </div>

            {clip.isImage && (
              <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
                <label className="text-[10px] text-zinc-500 shrink-0">Duracion</label>
                <input
                  type="range" min={1} max={30} step={0.5}
                  value={clip.duration}
                  onChange={(e) => setDuration(idx, parseFloat(e.target.value))}
                  className="flex-1 accent-violet-500"
                />
                <span className="text-[10px] text-zinc-300 w-8 text-right">{clip.duration}s</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-dashed border-zinc-600 rounded-xl text-sm text-zinc-400 hover:text-white transition-all"
      >
        + Agregar videos o imagenes
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {clips.length === 0 && (
        <p className="text-xs text-zinc-600">Agrega al menos un clip o imagen para unir con el video original.</p>
      )}

      <div className="text-xs text-zinc-600 bg-zinc-800/40 rounded-lg px-3 py-2">
        Formatos aceptados: MP4, WebM, MOV, AVI, JPG, PNG, WebP, GIF
      </div>
    </div>
  );
}
