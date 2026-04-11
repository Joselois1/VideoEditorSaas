"use client";

import type { TextSettings, TextPosition } from "@/types/editor";
import { formatTime } from "@/lib/utils";

const POSITIONS: { value: TextPosition; label: string }[] = [
  { value: "top-left",      label: "↖" },
  { value: "top-center",    label: "↑" },
  { value: "top-right",     label: "↗" },
  { value: "center-left",   label: "←" },
  { value: "center",        label: "·" },
  { value: "center-right",  label: "→" },
  { value: "bottom-left",   label: "↙" },
  { value: "bottom-center", label: "↓" },
  { value: "bottom-right",  label: "↘" },
];

const COLORS = ["white", "black", "yellow", "red", "cyan", "#ff69b4"];

interface Props { settings: TextSettings; onChange: (s: Partial<TextSettings>) => void; duration: number }

export default function TextPanel({ settings, onChange, duration }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-500">Texto</label>
        <input type="text" maxLength={120} placeholder="Escribe algo..."
          value={settings.text}
          onChange={(e) => onChange({ text: e.target.value })}
          className="bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-zinc-600" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500">Tamano ({settings.fontSize}px)</label>
          <input type="range" min={12} max={120} step={2} value={settings.fontSize}
            onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
            className="accent-violet-500" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500">Color</label>
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map((c) => (
              <button key={c} onClick={() => onChange({ color: c })}
                style={{ background: c }}
                className={`w-6 h-6 rounded-full border-2 transition-all ${settings.color === c ? "border-violet-400 scale-110" : "border-zinc-700"}`} />
            ))}
            <input type="color" value={settings.color.startsWith("#") ? settings.color : "#ffffff"}
              onChange={(e) => onChange({ color: e.target.value })}
              className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent" />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-500 block mb-2">Posicion</label>
        <div className="grid grid-cols-3 gap-1.5 w-32">
          {POSITIONS.map((p) => (
            <button key={p.value} onClick={() => onChange({ position: p.value })}
              className={`h-8 rounded text-base transition-all ${settings.position === p.value ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "startTime" as const, label: "Aparece en" },
          { key: "endTime"   as const, label: "Desaparece en" },
        ].map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">{f.label}</span>
              <span className="text-zinc-300">{formatTime(settings[f.key])}</span>
            </div>
            <input type="range" min={0} max={duration} step={0.1}
              value={settings[f.key]}
              onChange={(e) => onChange({ [f.key]: parseFloat(e.target.value) })}
              className="accent-violet-500" />
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-600">Requiere conexion a internet la primera vez (carga fuente tipografica).</p>
    </div>
  );
}
