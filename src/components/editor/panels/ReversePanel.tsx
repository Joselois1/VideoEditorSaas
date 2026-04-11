"use client";

import type { ReverseSettings } from "@/types/editor";

interface Props { settings: ReverseSettings; onChange: (s: Partial<ReverseSettings>) => void; duration: number }

export default function ReversePanel({ settings, onChange, duration }: Props) {
  const isLong = duration > 60;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">
        Reproduce el video de atras hacia adelante.
      </p>

      {isLong && (
        <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
          Tu video dura mas de 60 segundos. Invertir videos largos requiere mucha memoria y puede tardar.
        </div>
      )}

      <button
        onClick={() => onChange({ audio: !settings.audio })}
        className={`text-left px-4 py-3 rounded-xl border transition-all ${settings.audio ? "border-violet-500 bg-violet-600/10 text-white" : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"}`}>
        <p className="font-medium text-sm">Invertir audio tambien</p>
        <p className="text-xs mt-0.5 opacity-70">
          {settings.audio ? "El audio tambien se reproduce al reves." : "El video se invierte pero el audio se elimina."}
        </p>
      </button>
    </div>
  );
}
