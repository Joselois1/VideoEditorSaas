"use client";

import type { AudioSettings } from "@/types/editor";

interface AudioPanelProps {
  settings: AudioSettings;
  onChange: (settings: Partial<AudioSettings>) => void;
}

export default function AudioPanel({ settings, onChange }: AudioPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">Elige que hacer con el audio del video:</p>

      <div className="flex flex-col gap-2">
        {[
          {
            value: "normal",
            label: "Mantener audio",
            desc: "El video conserva su audio original.",
            active: !settings.mute && !settings.extractOnly,
            onClick: () => onChange({ mute: false, extractOnly: false }),
          },
          {
            value: "mute",
            label: "Silenciar video",
            desc: "Elimina el audio del video de salida.",
            active: settings.mute,
            onClick: () => onChange({ mute: true, extractOnly: false }),
          },
          {
            value: "extract",
            label: "Extraer audio (MP3)",
            desc: "Descarga solo el audio en formato MP3.",
            active: settings.extractOnly,
            onClick: () => onChange({ mute: false, extractOnly: true }),
          },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={opt.onClick}
            className={`
              text-left px-4 py-3 rounded-xl border transition-all
              ${opt.active
                ? "border-violet-500 bg-violet-600/10 text-white"
                : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-white"}
            `}
          >
            <p className="font-medium text-sm">{opt.label}</p>
            <p className="text-xs mt-0.5 opacity-70">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
