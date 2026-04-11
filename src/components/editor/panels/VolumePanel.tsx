"use client";

import type { VolumeSettings } from "@/types/editor";

interface Props { settings: VolumeSettings; onChange: (level: number) => void }

export default function VolumePanel({ settings, onChange }: Props) {
  const pct = Math.round(settings.level * 100);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">Volumen</span>
        <span className={`font-semibold ${pct === 0 ? "text-red-400" : pct > 150 ? "text-amber-400" : "text-white"}`}>
          {pct}%
        </span>
      </div>

      <input type="range" min={0} max={3} step={0.01}
        value={settings.level}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-violet-500" />

      <div className="grid grid-cols-4 gap-2">
        {[0, 50, 100, 150, 200].map((v) => (
          <button key={v} onClick={() => onChange(v / 100)}
            className={`py-2 rounded-lg text-xs font-medium transition-all ${pct === v ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
            {v}%
          </button>
        ))}
      </div>

      {settings.level === 0 && (
        <p className="text-xs text-zinc-500">Volumen a 0% = video silenciado (usa la herramienta Audio si quieres eliminarlo).</p>
      )}
      {settings.level > 1.5 && (
        <p className="text-xs text-amber-400/80">Aumentar mucho el volumen puede causar distorsion en el audio.</p>
      )}
    </div>
  );
}
