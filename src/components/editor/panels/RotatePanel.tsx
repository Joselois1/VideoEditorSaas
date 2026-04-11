"use client";

import type { RotateSettings } from "@/types/editor";

interface Props { settings: RotateSettings; onChange: (s: Partial<RotateSettings>) => void }

const ANGLES = [
  { value: 0 as const,   label: "0°" },
  { value: 90 as const,  label: "90°" },
  { value: 180 as const, label: "180°" },
  { value: 270 as const, label: "270°" },
];

export default function RotatePanel({ settings, onChange }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs text-zinc-500 mb-2">Rotar</p>
        <div className="grid grid-cols-4 gap-2">
          {ANGLES.map((a) => (
            <button key={a.value} onClick={() => onChange({ angle: a.value })}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${settings.angle === a.value ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-zinc-500 mb-2">Voltear</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "flipH" as const, label: "Horizontal ↔" },
            { key: "flipV" as const, label: "Vertical ↕" },
          ].map((f) => (
            <button key={f.key} onClick={() => onChange({ [f.key]: !settings[f.key] })}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${settings[f.key] ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
