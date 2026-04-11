"use client";

import { useCallback, useRef, useState } from "react";
import { formatFileSize } from "@/lib/utils";

const ACCEPTED = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/mpeg"];
const MAX_SIZE_MB = 500;

interface VideoUploaderProps {
  onFileSelected: (file: File) => void;
}

export default function VideoUploader({ onFileSelected }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) return "Formato no soportado. Usa MP4, WebM, MOV o AVI.";
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return `El archivo supera el limite de ${MAX_SIZE_MB} MB.`;
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) { setError(err); return; }
      setError(null);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          w-full max-w-2xl border-2 border-dashed rounded-2xl p-16
          flex flex-col items-center gap-5 cursor-pointer transition-all
          ${dragging
            ? "border-violet-500 bg-violet-500/10"
            : "border-zinc-700 hover:border-violet-600 hover:bg-white/5"}
        `}
      >
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
          <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15 10l4.553-2.07A1 1 0 0121 8.9V15.1a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold text-white">
            {dragging ? "Suelta el video aqui" : "Arrastra tu video aqui"}
          </p>
          <p className="text-zinc-400 text-sm mt-1">
            o haz clic para seleccionarlo
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 text-xs text-zinc-500">
          {["MP4", "WebM", "MOV", "AVI"].map((f) => (
            <span key={f} className="px-2 py-0.5 bg-zinc-800 rounded-full">{f}</span>
          ))}
          <span className="px-2 py-0.5 bg-zinc-800 rounded-full">Max {MAX_SIZE_MB} MB</span>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
