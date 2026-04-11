"use client";

import type { CompressSettings } from "@/types/editor";

const OPTIONS: { value: CompressSettings["quality"]; label: string; desc: string }[] = [
  { value: "high", label: "Alta calidad", desc: "Menor compresion, mayor tamano de archivo." },
  { value: "medium", label: "Equilibrado", desc: "Buena calidad con buen nivel de compresion." },
  { value: "low", label: "Maximo ahorro", desc: "Archivo mas pequeno, algo de perdida de calidad." },
];

interface CompressPanelProps {
  settings: CompressSettings;
  onChange: (quality: CompressSettings["quality"]) => void;
}

export default function CompressPanel({ settings, onChange }: CompressPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">Nivel de compresion del video de salida (H.264/MP4):</p>
      <div className="flex flex-col gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              text-left px-4 py-3 rounded-xl border transition-all
              ${settings.quality === opt.value
                ? "border-violet-500 bg-violet-600/10 text-white"
                : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-white"}
            `}
          >
            <p className="font-medium text-sm">{opt.label}</p>
            <p className="text-xs mt-0.5 opacity-70">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
