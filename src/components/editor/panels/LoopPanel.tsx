"use client";

import type { LoopSettings } from "@/types/editor";
import { formatTime } from "@/lib/utils";

interface Props { settings: LoopSettings; onChange: (count: number) => void; duration: number }

export default function LoopPanel({ settings, onChange, duration }: Props) {
  const totalDuration = duration * settings.count;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-zinc-400">
        Repite el video varias veces en un solo archivo.
      </p>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Repeticiones</span>
          <span className="text-white font-medium">{settings.count}x</span>
        </div>
        <input type="range" min={2} max={10} step={1}
          value={settings.count}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full accent-violet-500" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[2, 3, 4, 5, 8, 10].map((n) => (
          <button key={n} onClick={() => onChange(n)}
            className={`py-2 rounded-lg text-sm font-medium transition-all ${settings.count === n ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
            {n}x
          </button>
        ))}
      </div>

      <div className="text-xs text-zinc-500 bg-zinc-800/50 rounded-lg px-3 py-2">
        Duracion del video final: <span className="text-zinc-300">{formatTime(totalDuration)}</span>
      </div>
    </div>
  );
}
