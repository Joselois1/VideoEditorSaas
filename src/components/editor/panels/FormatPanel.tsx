"use client";

import type { VideoFormat } from "@/types/editor";

const FORMATS: { value: VideoFormat; label: string; desc: string }[] = [
  { value: "mp4", label: "MP4", desc: "Compatible con todos los dispositivos." },
  { value: "webm", label: "WebM", desc: "Ideal para la web, menor tamano." },
  { value: "mov", label: "MOV", desc: "Formato de Apple / iMovie." },
  { value: "avi", label: "AVI", desc: "Compatibilidad maxima con Windows." },
];

interface FormatPanelProps {
  current: VideoFormat;
  onChange: (format: VideoFormat) => void;
}

export default function FormatPanel({ current, onChange }: FormatPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">Convierte tu video al formato que necesitas:</p>
      <div className="grid grid-cols-2 gap-2">
        {FORMATS.map((f) => (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className={`
              text-left px-4 py-3 rounded-xl border transition-all
              ${current === f.value
                ? "border-violet-500 bg-violet-600/10 text-white"
                : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-white"}
            `}
          >
            <p className="font-semibold text-sm">{f.label}</p>
            <p className="text-xs mt-0.5 opacity-70">{f.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
