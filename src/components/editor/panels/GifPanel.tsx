"use client";

import type { GifSettings } from "@/types/editor";
import { formatTime, clamp } from "@/lib/utils";

interface Props { settings: GifSettings; onChange: (s: Partial<GifSettings>) => void; duration: number }

const FPS_OPTIONS = [5, 8, 10, 15, 20];
const WIDTH_OPTIONS = [320, 480, 640];

export default function GifPanel({ settings, onChange, duration }: Props) {
  const gifDuration = settings.endTime - settings.startTime;

  const handleStart = (v: number) => onChange({ startTime: clamp(v, 0, settings.endTime - 0.5) });
  const handleEnd   = (v: number) => onChange({ endTime: clamp(v, settings.startTime + 0.5, Math.min(duration, settings.startTime + 15)) });

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-zinc-400">
        Convierte un fragmento del video en un GIF animado.
      </p>

      <div className="flex flex-col gap-3">
        {[
          { label: "Inicio", value: settings.startTime, handler: handleStart },
          { label: "Fin",    value: settings.endTime,   handler: handleEnd   },
        ].map((f) => (
          <div key={f.label} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">{f.label}</span>
              <span className="text-zinc-300">{formatTime(f.value)}</span>
            </div>
            <input type="range" min={0} max={duration} step={0.1}
              value={f.value} onChange={(e) => f.handler(parseFloat(e.target.value))}
              className="w-full accent-violet-500" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-zinc-500 mb-2">FPS del GIF</p>
          <div className="flex flex-wrap gap-1.5">
            {FPS_OPTIONS.map((f) => (
              <button key={f} onClick={() => onChange({ fps: f })}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${settings.fps === f ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-2">Ancho</p>
          <div className="flex flex-wrap gap-1.5">
            {WIDTH_OPTIONS.map((w) => (
              <button key={w} onClick={() => onChange({ width: w })}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${settings.width === w ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-xs text-zinc-500 bg-zinc-800/50 rounded-lg px-3 py-2 space-y-0.5">
        <p>Duracion: <span className="text-zinc-300">{gifDuration.toFixed(1)}s</span></p>
        <p>Max recomendado: 10s para mantener un tamano razonable.</p>
      </div>
    </div>
  );
}
