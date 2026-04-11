"use client";

import { useState } from "react";
import { formatTime, clamp } from "@/lib/utils";
import type { TrimSettings } from "@/types/editor";

interface TrimPanelProps {
  duration: number;
  settings: TrimSettings;
  onChange: (start: number, end: number) => void;
}

export default function TrimPanel({ duration, settings, onChange }: TrimPanelProps) {
  const [start, setStart] = useState(settings.startTime);
  const [end, setEnd] = useState(settings.endTime);

  const handleStart = (val: number) => {
    const v = clamp(val, 0, end - 0.1);
    setStart(v);
    onChange(v, end);
  };

  const handleEnd = (val: number) => {
    const v = clamp(val, start + 0.1, duration);
    setEnd(v);
    onChange(start, v);
  };

  const trimmedDuration = end - start;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">Duracion del corte</span>
        <span className="text-white font-medium">{formatTime(trimmedDuration)}</span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-zinc-500">
            <label>Inicio</label>
            <span className="text-zinc-300">{formatTime(start)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.01}
            value={start}
            onChange={(e) => handleStart(parseFloat(e.target.value))}
            className="w-full accent-violet-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-zinc-500">
            <label>Fin</label>
            <span className="text-zinc-300">{formatTime(end)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.01}
            value={end}
            onChange={(e) => handleEnd(parseFloat(e.target.value))}
            className="w-full accent-violet-500"
          />
        </div>
      </div>

      <div className="relative h-8 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="absolute top-0 h-full bg-violet-600/40 border-l-2 border-r-2 border-violet-500"
          style={{
            left: `${(start / duration) * 100}%`,
            width: `${((end - start) / duration) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
