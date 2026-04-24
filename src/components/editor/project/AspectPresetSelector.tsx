"use client";

import type { AspectPreset } from "@/types/project";

interface Preset {
  id: AspectPreset;
  label: string;
  hint: string;
  w: number;
  h: number;
}

const PRESETS: Preset[] = [
  { id: "original", label: "Original", hint: "Mantener proporción", w: 16, h: 9 },
  { id: "9:16",     label: "9:16",     hint: "TikTok / Reels / Shorts", w: 9, h: 16 },
  { id: "1:1",      label: "1:1",      hint: "Post cuadrado", w: 1, h: 1 },
  { id: "4:5",      label: "4:5",      hint: "Feed de Instagram", w: 4, h: 5 },
  { id: "16:9",     label: "16:9",     hint: "YouTube / horizontal", w: 16, h: 9 },
];

const RESOLUTIONS = [
  { value: 480,  label: "480p" },
  { value: 720,  label: "720p" },
  { value: 1080, label: "1080p" },
  { value: 1440, label: "1440p" },
];

interface AspectPresetSelectorProps {
  aspect: AspectPreset;
  maxHeight: number;
  previewMode: boolean;
  onAspectChange: (aspect: AspectPreset) => void;
  onHeightChange: (h: number) => void;
  onPreviewModeChange: (on: boolean) => void;
}

export default function AspectPresetSelector({
  aspect, maxHeight, previewMode,
  onAspectChange, onHeightChange, onPreviewModeChange,
}: AspectPresetSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Formato de salida</h3>

      {/* Preview mode toggle — clave para velocidad de iteracion */}
      <label
        className={`
          flex items-center gap-3 cursor-pointer rounded-md p-3 transition-colors border
          ${previewMode
            ? "bg-violet-500/10 border-violet-500/30"
            : "bg-zinc-950 border-white/10 hover:border-white/20"
          }
        `}
      >
        <input
          type="checkbox"
          checked={previewMode}
          onChange={(e) => onPreviewModeChange(e.target.checked)}
          className="w-4 h-4 accent-violet-500 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white">
            Preview rápido
          </p>
          <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
            {previewMode
              ? "Render en 480p — desactivá para la descarga final"
              : "Render en la calidad elegida (más lento)"}
          </p>
        </div>
      </label>

      {/* Aspect presets */}
      <div className="grid grid-cols-5 gap-1">
        {PRESETS.map((p) => {
          const active = aspect === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onAspectChange(p.id)}
              title={p.hint}
              className={`
                flex flex-col items-center gap-1.5 p-2 rounded-md text-xs font-medium transition-colors border
                ${active
                  ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
                  : "bg-white/[0.03] text-zinc-400 border-white/5 hover:bg-white/[0.06] hover:text-white"
                }
              `}
            >
              <div
                className="border rounded-sm border-current opacity-80"
                style={{
                  width: Math.min(24, p.w * 3),
                  height: Math.min(24, p.h * 3),
                }}
              />
              <span className="text-[10px] leading-none">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Resolucion — se desactiva visualmente cuando preview mode esta ON */}
      <div className={`flex items-center gap-2 transition-opacity ${previewMode ? "opacity-40" : ""}`}>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Calidad {previewMode && "(→ 480p)"}
        </span>
        <div className="flex gap-1 ml-auto">
          {RESOLUTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => onHeightChange(r.value)}
              disabled={previewMode}
              className={`
                text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors border
                ${maxHeight === r.value
                  ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
                  : "bg-white/[0.03] text-zinc-400 border-white/5 hover:bg-white/[0.06] hover:text-white"
                }
                disabled:cursor-not-allowed
              `}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
