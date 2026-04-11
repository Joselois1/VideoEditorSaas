"use client";

import type { FpsSettings } from "@/types/editor";

interface Props { settings: FpsSettings; onChange: (fps: number) => void }

const PRESETS = [
  { fps: 15,  label: "15 fps", desc: "Archivo ligero" },
  { fps: 24,  label: "24 fps", desc: "Cine" },
  { fps: 30,  label: "30 fps", desc: "Estandar" },
  { fps: 60,  label: "60 fps", desc: "Fluido" },
];

export default function FpsPanel({ settings, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">
        Cambia los fotogramas por segundo del video de salida.
      </p>
      <div className="flex flex-col gap-2">
        {PRESETS.map((p) => (
          <button key={p.fps} onClick={() => onChange(p.fps)}
            className={`text-left px-4 py-3 rounded-xl border transition-all ${settings.fps === p.fps ? "border-violet-500 bg-violet-600/10 text-white" : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-white"}`}>
            <p className="font-medium text-sm">{p.label}</p>
            <p className="text-xs mt-0.5 opacity-70">{p.desc}</p>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-500">Valor personalizado</label>
        <input type="number" min={1} max={120} value={settings.fps}
          onChange={(e) => onChange(parseInt(e.target.value) || 30)}
          className="bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-violet-500 w-28" />
      </div>
    </div>
  );
}
