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
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Formato de salida</h3>
      </div>

      {/* Preview mode toggle — clave para velocidad de iteracion */}
      <label
        className={`
          flex items-center gap-3 cursor-pointer rounded-lg p-3 transition-all border
          ${previewMode
            ? "bg-gradient-to-r from-fuchsia-500/15 via-violet-500/10 to-transparent border-fuchsia-500/40 shadow-sm shadow-fuchsia-500/10"
            : "bg-zinc-950 border-white/10 hover:border-white/20"
          }
        `}
      >
        <input
          type="checkbox"
          checked={previewMode}
          onChange={(e) => onPreviewModeChange(e.target.checked)}
          className="w-4 h-4 accent-fuchsia-500 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white flex items-center gap-1.5">
            <span>⚡</span>
            <span>Preview rápido</span>
            {previewMode && (
              <span className="text-[9px] uppercase tracking-wider bg-fuchsia-500/30 text-fuchsia-200 px-1.5 py-0.5 rounded">
                ON
              </span>
            )}
          </p>
          <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
            {previewMode
              ? "Render en 480p para iterar — desactivá para la descarga final"
              : "Render en la calidad elegida — más lento"}
          </p>
        </div>
      </label>

      {/* Aspect presets */}
      <div className="grid grid-cols-5 gap-1.5">
        {PRESETS.map((p) => {
          const active = aspect === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onAspectChange(p.id)}
              title={p.hint}
              className={`
                group flex flex-col items-center gap-1.5 p-2 rounded-lg text-xs font-medium transition-all
                ${active
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/30"
                  : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }
              `}
            >
              {/* mini proporcion visual */}
              <div
                className={`border-2 rounded-sm ${active ? "border-white/80" : "border-current opacity-70"}`}
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
          Calidad {previewMode && "(override 480p)"}
        </span>
        <div className="flex gap-1 ml-auto">
          {RESOLUTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => onHeightChange(r.value)}
              disabled={previewMode}
              className={`
                text-[11px] px-2.5 py-1 rounded-md font-semibold transition-colors
                ${maxHeight === r.value
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
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
