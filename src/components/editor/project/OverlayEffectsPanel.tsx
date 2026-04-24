"use client";

import type { Asset, OverlayClip, OverlayPosition, OverlaySize } from "@/types/project";

interface OverlayEffectsPanelProps {
  clip: OverlayClip;
  asset: Asset;
  timelineDuration: number;
  onUpdate: (patch: Partial<OverlayClip>) => void;
  onClose: () => void;
  onRemove: () => void;
}

const POSITIONS: { id: OverlayPosition; row: number; col: number }[] = [
  { id: "top-left",      row: 0, col: 0 },
  { id: "top-center",    row: 0, col: 1 },
  { id: "top-right",     row: 0, col: 2 },
  { id: "center-left",   row: 1, col: 0 },
  { id: "center",        row: 1, col: 1 },
  { id: "center-right",  row: 1, col: 2 },
  { id: "bottom-left",   row: 2, col: 0 },
  { id: "bottom-center", row: 2, col: 1 },
  { id: "bottom-right",  row: 2, col: 2 },
];

const SIZES: { id: OverlaySize; label: string; hint: string }[] = [
  { id: "small",  label: "S", hint: "20% ancho" },
  { id: "medium", label: "M", hint: "35% ancho" },
  { id: "large",  label: "L", hint: "50% ancho" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function OverlayEffectsPanel({
  clip, asset, timelineDuration, onUpdate, onClose, onRemove,
}: OverlayEffectsPanelProps) {

  return (
    <aside className="bg-zinc-900/60 border border-white/10 rounded-xl p-4 flex flex-col gap-4">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 bg-white/5 text-zinc-400 border border-white/10">
            Sobreimpresión
          </span>
          <p className="text-sm font-medium text-white truncate" title={asset.name}>
            {asset.name}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-6 h-6 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-white text-sm flex items-center justify-center transition-colors"
          title="Cerrar"
        >
          ×
        </button>
      </header>

      {/* Preview miniatura */}
      {asset.thumbnailUrl && (
        <div className="w-full aspect-video bg-black rounded-md overflow-hidden border border-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Posición */}
      <Row label="Posición">
        <div className="grid grid-cols-3 gap-1 aspect-[3/2] w-full">
          {POSITIONS.map((pos) => {
            const active = clip.position === pos.id;
            return (
              <button
                key={pos.id}
                onClick={() => onUpdate({ position: pos.id })}
                title={pos.id}
                className={`
                  flex items-center justify-center rounded-md transition-colors border
                  ${active
                    ? "bg-violet-500/15 border-violet-500/40"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                  }
                `}
              >
                <span className={`w-2 h-2 rounded-full ${active ? "bg-violet-400" : "bg-zinc-600"}`} />
              </button>
            );
          })}
        </div>
      </Row>

      {/* Tamaño */}
      <Row label="Tamaño">
        <div className="grid grid-cols-3 gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s.id}
              onClick={() => onUpdate({ size: s.id })}
              title={s.hint}
              className={`
                flex flex-col items-center gap-0.5 py-2 rounded-md transition-colors border
                ${clip.size === s.id
                  ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
                  : "bg-white/[0.03] text-zinc-400 border-white/5 hover:bg-white/[0.06] hover:text-white"
                }
              `}
            >
              <span className="text-xs font-semibold">{s.label}</span>
              <span className="text-[9px] opacity-80">{s.hint}</span>
            </button>
          ))}
        </div>
      </Row>

      {/* Tiempo */}
      <Row label={`Tiempo (0 → ${timelineDuration.toFixed(1)}s)`}>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500">Aparece a</span>
            <input
              type="number" min={0} max={clip.endAt - 0.1} step={0.1}
              value={clip.startAt.toFixed(1)}
              onChange={(e) => {
                const v = Math.max(0, Math.min(clip.endAt - 0.1, parseFloat(e.target.value) || 0));
                onUpdate({ startAt: v });
              }}
              className="bg-zinc-950 border border-white/10 rounded-md px-2 py-1 text-xs text-white focus:border-violet-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500">Desaparece a</span>
            <input
              type="number" min={clip.startAt + 0.1} max={timelineDuration || 999} step={0.1}
              value={clip.endAt.toFixed(1)}
              onChange={(e) => {
                const v = Math.max(clip.startAt + 0.1, Math.min(timelineDuration || 999, parseFloat(e.target.value) || 0));
                onUpdate({ endAt: v });
              }}
              className="bg-zinc-950 border border-white/10 rounded-md px-2 py-1 text-xs text-white focus:border-violet-500 outline-none"
            />
          </div>
        </div>
        <p className="text-[10px] text-zinc-500">Visible por: {(clip.endAt - clip.startAt).toFixed(1)}s</p>
      </Row>

      {/* Opacidad */}
      <Row label="Opacidad">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0.1} max={1} step={0.05}
            value={clip.opacity}
            onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
            className="flex-1 accent-violet-500"
          />
          <span className="text-xs text-zinc-300 w-10 tabular-nums text-right">
            {Math.round(clip.opacity * 100)}%
          </span>
        </div>
      </Row>

      {/* Eliminar */}
      <button
        onClick={onRemove}
        className="mt-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-lg py-2 transition-colors"
      >
        Quitar sobreimpresión
      </button>
    </aside>
  );
}
