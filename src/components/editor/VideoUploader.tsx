"use client";

import { useCallback, useRef, useState } from "react";

const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/mpeg"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALL_ACCEPTED = [...VIDEO_TYPES, ...IMAGE_TYPES];
const MAX_SIZE_MB = 500;

interface VideoUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export default function VideoUploader({ onFilesSelected }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (files: File[]): string | null => {
    if (files.length === 0) return "No se seleccionaron archivos.";
    const first = files[0];
    if (!VIDEO_TYPES.includes(first.type))
      return "El primer archivo debe ser un video (MP4, WebM, MOV o AVI).";
    for (const f of files) {
      if (!ALL_ACCEPTED.includes(f.type))
        return `Formato no soportado: ${f.name}`;
      if (f.size > MAX_SIZE_MB * 1024 * 1024)
        return `"${f.name}" supera el limite de ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleFiles = useCallback(
    (files: File[]) => {
      const err = validate(files);
      if (err) { setError(err); return; }
      setError(null);
      onFilesSelected(files);
    },
    [onFilesSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) handleFiles(files);
    },
    [handleFiles]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) handleFiles(files);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          w-full max-w-2xl border border-dashed rounded-xl p-14
          flex flex-col items-center gap-5 cursor-pointer transition-colors
          ${dragging
            ? "border-violet-500 bg-violet-500/[0.04]"
            : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"
          }
        `}
      >
        <div className={`
          w-14 h-14 rounded-lg flex items-center justify-center transition-colors
          ${dragging ? "bg-violet-500/15 text-violet-300" : "bg-white/[0.04] text-zinc-400"}
        `}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15 10l4.553-2.07A1 1 0 0121 8.9V15.1a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-lg font-medium text-white">
            {dragging ? "Suelta los archivos aqui" : "Arrastra tus archivos aqui"}
          </p>
          <p className="text-zinc-400 text-sm mt-1">
            Un video para editar, o varios para unirlos
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            o haz clic para seleccionarlos
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 text-xs text-zinc-500">
          {["MP4", "WebM", "MOV", "AVI", "JPG", "PNG"].map((f) => (
            <span
              key={f}
              className="px-2 py-0.5 bg-white/[0.04] border border-white/5 rounded"
            >
              {f}
            </span>
          ))}
          <span className="px-2 py-0.5 bg-white/[0.04] border border-white/5 rounded text-zinc-400">
            Max {MAX_SIZE_MB} MB c/u
          </span>
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
        multiple
        accept={ALL_ACCEPTED.join(",")}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
