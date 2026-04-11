"use client";

import type { SpeedValue } from "@/types/editor";

const SPEEDS: { value: SpeedValue; label: string }[] = [
  { value: 0.25, label: "0.25x" },
  { value: 0.5, label: "0.5x" },
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
];

interface SpeedPanelProps {
  value: SpeedValue;
  onChange: (value: SpeedValue) => void;
}

export default function SpeedPanel({ value, onChange }: SpeedPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">
        Velocidad seleccionada:{" "}
        <span className="text-white font-semibold">{value}x</span>
        {value < 1 && <span className="text-zinc-500"> — camara lenta</span>}
        {value > 1 && <span className="text-zinc-500"> — camara rapida</span>}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {SPEEDS.map((s) => (
          <button
            key={s.value}
            onClick={() => onChange(s.value)}
            className={`
              py-2.5 rounded-lg text-sm font-medium transition-all
              ${value === s.value
                ? "bg-violet-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}
            `}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
