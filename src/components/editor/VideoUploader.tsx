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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 relative">
      {/* glows de fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-violet-600/10 blur-3xl rounded-full" />
        <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-fuchsia-500/10 blur-3xl rounded-full" />
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative w-full max-w-2xl rounded-3xl p-[2px] cursor-pointer transition-all
          ${dragging
            ? "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-500"
            : "bg-gradient-to-br from-white/10 via-white/5 to-white/10 hover:from-violet-500/50 hover:via-fuchsia-500/50 hover:to-orange-500/50"
          }
        `}
      >
        <div className={`
          rounded-[22px] p-14 flex flex-col items-center gap-5 transition-all
          ${dragging ? "bg-zinc-900" : "bg-zinc-950 group-hover:bg-zinc-900"}
        `}>
          {/* icono con gradiente */}
          <div className={`
            relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all
            ${dragging
              ? "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-500 scale-110"
              : "bg-gradient-to-br from-violet-600/20 via-fuchsia-600/20 to-orange-500/20"
            }
          `}>
            <svg
              className={`w-10 h-10 transition-colors ${dragging ? "text-white" : "text-fuchsia-300"}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M15 10l4.553-2.07A1 1 0 0121 8.9V15.1a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            {/* glow halo */}
            <div className={`
              absolute inset-0 rounded-2xl blur-xl -z-10 transition-opacity
              ${dragging
                ? "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-500 opacity-60"
                : "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-500 opacity-0"
              }
            `} />
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {dragging ? "Suelta los archivos aqui" : "Arrastra tus archivos aqui"}
            </p>
            <p className="text-zinc-400 text-sm mt-2">
              Un video para editar, o varios para unirlos
            </p>
            <p className="text-zinc-600 text-xs mt-1">
              o haz clic para seleccionarlos
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-xs text-zinc-400">
            {["MP4", "WebM", "MOV", "AVI", "JPG", "PNG"].map((f) => (
              <span
                key={f}
                className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full font-medium"
              >
                {f}
              </span>
            ))}
            <span className="px-2.5 py-1 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-fuchsia-500/20 rounded-full font-medium text-fuchsia-200">
              Max {MAX_SIZE_MB} MB c/u
            </span>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 relative">
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
