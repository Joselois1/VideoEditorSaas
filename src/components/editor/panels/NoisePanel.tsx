"use client";

import type { NoiseSettings } from "@/types/editor";

interface Props { settings: NoiseSettings; onChange: (strength: number) => void }

const PRESETS = [
  { label: "Suave",    value: 10, desc: "Elimina ruido leve de fondo" },
  { label: "Medio",   value: 25, desc: "Balance entre calidad y limpieza" },
  { label: "Agresivo", value: 40, desc: "Elimina ruido fuerte (puede sonar artificial)" },
];

export default function NoisePanel({ settings, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">
        Reduce el ruido de fondo del audio (ventiladores, ambiente, etc.).
      </p>

      <div className="flex flex-col gap-2">
        {PRESETS.map((p) => (
          <button key={p.value} onClick={() => onChange(p.value)}
            className={`text-left px-4 py-3 rounded-xl border transition-all ${settings.strength === p.value ? "border-violet-500 bg-violet-600/10 text-white" : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-white"}`}>
            <p className="font-medium text-sm">{p.label}</p>
            <p className="text-xs mt-0.5 opacity-70">{p.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">Nivel personalizado</span>
          <span className="text-zinc-300">{settings.strength}</span>
        </div>
        <input type="range" min={5} max={50} step={1} value={settings.strength}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full accent-violet-500" />
      </div>
    </div>
  );
}
