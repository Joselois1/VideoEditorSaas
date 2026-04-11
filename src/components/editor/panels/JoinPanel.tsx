"use client";

import { useRef } from "react";
import { formatFileSize } from "@/lib/utils";

const ACCEPTED = "video/mp4,video/webm,video/quicktime,video/x-msvideo";

interface Props {
  originalName: string;
  additionalFiles: File[];
  onChange: (files: File[]) => void;
}

export default function JoinPanel({ originalName, additionalFiles, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    onChange([...additionalFiles, ...Array.from(newFiles)]);
  };

  const remove = (idx: number) => onChange(additionalFiles.filter((_, i) => i !== idx));

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...additionalFiles];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveDown = (idx: number) => {
    if (idx === additionalFiles.length - 1) return;
    const next = [...additionalFiles];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">
        Concatena varios clips en un solo video.
      </p>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-zinc-500 mb-1">Orden de los clips</p>

        {/* Original — always first, cannot move */}
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/80 rounded-lg">
          <span className="text-xs text-zinc-500 w-4">1</span>
          <span className="text-xs text-zinc-300 flex-1 truncate">{originalName}</span>
          <span className="text-xs text-violet-400">original</span>
        </div>

        {additionalFiles.map((f, idx) => (
          <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg">
            <span className="text-xs text-zinc-500 w-4">{idx + 2}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-300 truncate">{f.name}</p>
              <p className="text-[10px] text-zinc-600">{formatFileSize(f.size)}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => moveUp(idx)} disabled={idx === 0}
                className="text-zinc-500 hover:text-zinc-200 disabled:opacity-30 text-xs px-1">↑</button>
              <button onClick={() => moveDown(idx)} disabled={idx === additionalFiles.length - 1}
                className="text-zinc-500 hover:text-zinc-200 disabled:opacity-30 text-xs px-1">↓</button>
              <button onClick={() => remove(idx)}
                className="text-zinc-600 hover:text-red-400 transition-colors text-xs px-1">✕</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-dashed border-zinc-600 rounded-xl text-sm text-zinc-400 hover:text-white transition-all">
        + Agregar clips
      </button>

      <input ref={inputRef} type="file" multiple accept={ACCEPTED}
        className="hidden" onChange={(e) => addFiles(e.target.files)} />

      {additionalFiles.length === 0 && (
        <p className="text-xs text-zinc-600">Agrega al menos un clip para unir.</p>
      )}
    </div>
  );
}
