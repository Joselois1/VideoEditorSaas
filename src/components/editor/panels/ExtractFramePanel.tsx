"use client";

import type { ExtractFrameSettings } from "@/types/editor";
import { formatTime } from "@/lib/utils";

interface Props { settings: ExtractFrameSettings; onChange: (time: number) => void; duration: number }

export default function ExtractFramePanel({ settings, onChange, duration }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-zinc-400">
        Captura un fotograma del video y lo descarga como imagen PNG.
      </p>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Momento a capturar</span>
          <span className="text-white font-medium">{formatTime(settings.time)}</span>
        </div>
        <input type="range" min={0} max={duration} step={0.1}
          value={settings.time}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full accent-violet-500" />
      </div>

      <div className="text-xs text-zinc-500 bg-zinc-800/50 rounded-lg px-3 py-2">
        El resultado se descargara como <span className="text-zinc-300">.png</span> con la resolucion original del video.
      </div>
    </div>
  );
}
