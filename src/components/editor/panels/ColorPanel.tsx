"use client";

import type { ColorSettings } from "@/types/editor";

interface Props { settings: ColorSettings; onChange: (s: Partial<ColorSettings>) => void }

const SLIDERS = [
  { key: "brightness" as const, label: "Brillo",     min: -1,  max: 1,  step: 0.05, neutral: 0   },
  { key: "contrast"   as const, label: "Contraste",  min: 0.5, max: 2,  step: 0.05, neutral: 1   },
  { key: "saturation" as const, label: "Saturacion", min: 0,   max: 3,  step: 0.05, neutral: 1   },
];

function fmt(v: number) { return v.toFixed(2) }

export default function ColorPanel({ settings, onChange }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {SLIDERS.map((s) => (
        <div key={s.key} className="flex flex-col gap-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">{s.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-zinc-300">{fmt(settings[s.key])}</span>
              <button onClick={() => onChange({ [s.key]: s.neutral })}
                className="text-zinc-600 hover:text-zinc-400 transition-colors text-[10px]">
                reset
              </button>
            </div>
          </div>
          <input type="range" min={s.min} max={s.max} step={s.step}
            value={settings[s.key]}
            onChange={(e) => onChange({ [s.key]: parseFloat(e.target.value) })}
            className="w-full accent-violet-500" />
        </div>
      ))}
      <button
        onClick={() => onChange({ brightness: 0, contrast: 1, saturation: 1 })}
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-left">
        Restaurar valores originales
      </button>
    </div>
  );
}
