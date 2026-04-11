"use client";

import type { FadeSettings } from "@/types/editor";

interface Props { settings: FadeSettings; onChange: (s: Partial<FadeSettings>) => void; duration: number }

export default function FadePanel({ settings, onChange, duration }: Props) {
  const maxFade = Math.floor(duration / 2);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-zinc-400">
        Agrega una transicion suave al inicio y/o al final del video.
      </p>

      {[
        { key: "fadeIn" as const,  label: "Fade in (inicio)",  desc: "Aparece desde negro" },
        { key: "fadeOut" as const, label: "Fade out (final)",  desc: "Desaparece a negro" },
      ].map((f) => (
        <div key={f.key} className="flex flex-col gap-2">
          <div className="flex justify-between text-xs">
            <div>
              <span className="text-zinc-400">{f.label}</span>
              <span className="text-zinc-600 ml-1">— {f.desc}</span>
            </div>
            <span className="text-zinc-300">{settings[f.key]}s</span>
          </div>
          <input type="range" min={0} max={maxFade} step={0.1}
            value={settings[f.key]}
            onChange={(e) => onChange({ [f.key]: parseFloat(e.target.value) })}
            className="w-full accent-violet-500" />
        </div>
      ))}

      {settings.fadeIn === 0 && settings.fadeOut === 0 && (
        <p className="text-xs text-zinc-600">Mueve los controles para activar el efecto.</p>
      )}
    </div>
  );
}
