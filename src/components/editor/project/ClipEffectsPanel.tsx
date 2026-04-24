"use client";

import type { Asset, VideoClip, ClipEffects } from "@/types/project";
import { IMAGE_DEFAULT_DURATION } from "@/types/project";

interface ClipEffectsPanelProps {
  clip: VideoClip;
  asset: Asset;
  onUpdate: (patch: Partial<ClipEffects>) => void;
  onClose: () => void;
  onRemove: () => void;
}

function fmtSecs(s: number) {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1);
  return `${m}:${sec.padStart(4, "0")}`;
}

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

export default function ClipEffectsPanel({
  clip, asset, onUpdate, onClose, onRemove,
}: ClipEffectsPanelProps) {
  const isImage = asset.type === "image";
  const fx = clip.effects;

  const trim = fx.trim ?? { start: 0, end: asset.duration ?? 0 };
  const imageDur = fx.imageDuration ?? IMAGE_DEFAULT_DURATION;
  const speed = fx.speed ?? 1;
  const rotation = fx.rotation ?? 0;
  const brightness = fx.brightness ?? 0;
  const contrast = fx.contrast ?? 1;
  const saturation = fx.saturation ?? 1;
  const fadeIn = fx.fadeIn ?? 0;
  const fadeOut = fx.fadeOut ?? 0;
  const volume = fx.volume ?? 1;
  const muted = fx.mute ?? false;

  return (
    <aside className="bg-zinc-900/90 border border-fuchsia-500/20 rounded-2xl p-4 flex flex-col gap-4 shadow-xl shadow-fuchsia-900/20">
      {/* Header */}
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`
            text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0
            ${isImage ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30" : "bg-violet-500/20 text-violet-300 border border-violet-500/30"}
          `}>
            {isImage ? "Imagen" : "Video"}
          </span>
          <p className="text-sm font-semibold text-white truncate" title={asset.name}>
            {asset.name}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-sm flex items-center justify-center transition-colors"
          title="Cerrar"
        >
          ×
        </button>
      </header>

      {/* Preview thumb */}
      {asset.thumbnailUrl && (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Trim (video) / Duracion (imagen) */}
      {isImage ? (
        <Row label="Duración (segundos)">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0.5} max={15} step={0.5}
              value={imageDur}
              onChange={(e) => onUpdate({ imageDuration: parseFloat(e.target.value) })}
              className="flex-1 accent-fuchsia-400"
            />
            <span className="text-xs text-zinc-300 w-10 tabular-nums text-right">{imageDur.toFixed(1)}s</span>
          </div>
        </Row>
      ) : (
        <Row label={`Recortar (0 → ${asset.duration?.toFixed(1) ?? "?"}s)`}>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500">Inicio</span>
              <input
                type="number" min={0} max={trim.end} step={0.1}
                value={trim.start.toFixed(1)}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(trim.end - 0.1, parseFloat(e.target.value) || 0));
                  onUpdate({ trim: { start: v, end: trim.end } });
                }}
                className="bg-zinc-950 border border-white/10 rounded-md px-2 py-1 text-xs text-white focus:border-fuchsia-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500">Fin</span>
              <input
                type="number" min={trim.start + 0.1} max={asset.duration ?? 999} step={0.1}
                value={trim.end.toFixed(1)}
                onChange={(e) => {
                  const v = Math.max(trim.start + 0.1, Math.min(asset.duration ?? 999, parseFloat(e.target.value) || 0));
                  onUpdate({ trim: { start: trim.start, end: v } });
                }}
                className="bg-zinc-950 border border-white/10 rounded-md px-2 py-1 text-xs text-white focus:border-fuchsia-500 outline-none"
              />
            </div>
          </div>
          <p className="text-[10px] text-zinc-500">Duración: {fmtSecs((trim.end - trim.start) / speed)}</p>
        </Row>
      )}

      {/* Velocidad (solo video) */}
      {!isImage && (
        <Row label="Velocidad">
          <div className="grid grid-cols-6 gap-1">
            {[0.25, 0.5, 1, 1.5, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => onUpdate({ speed: s })}
                className={`
                  text-xs py-1.5 rounded-md font-medium transition-colors
                  ${Math.abs(speed - s) < 0.01
                    ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  }
                `}
              >
                {s}x
              </button>
            ))}
          </div>
        </Row>
      )}

      {/* Rotación */}
      <Row label="Rotación y flip">
        <div className="flex items-center gap-1.5">
          {[0, 90, 180, 270].map((deg) => (
            <button
              key={deg}
              onClick={() => onUpdate({ rotation: deg as 0 | 90 | 180 | 270 })}
              className={`
                text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors
                ${rotation === deg
                  ? "bg-violet-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }
              `}
            >
              {deg}°
            </button>
          ))}
          <div className="ml-auto flex gap-1">
            <button
              onClick={() => onUpdate({ flipH: !fx.flipH })}
              title="Flip horizontal"
              className={`text-xs px-2 py-1.5 rounded-md font-medium transition-colors ${fx.flipH ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
            >⇔</button>
            <button
              onClick={() => onUpdate({ flipV: !fx.flipV })}
              title="Flip vertical"
              className={`text-xs px-2 py-1.5 rounded-md font-medium transition-colors ${fx.flipV ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
            >⇕</button>
          </div>
        </div>
      </Row>

      {/* Color */}
      <Row label="Color">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 w-14">Brillo</span>
            <input
              type="range" min={-0.5} max={0.5} step={0.02}
              value={brightness}
              onChange={(e) => onUpdate({ brightness: parseFloat(e.target.value) })}
              className="flex-1 accent-fuchsia-400"
            />
            <span className="text-[10px] text-zinc-400 w-10 text-right tabular-nums">{brightness.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 w-14">Contraste</span>
            <input
              type="range" min={0.5} max={2} step={0.05}
              value={contrast}
              onChange={(e) => onUpdate({ contrast: parseFloat(e.target.value) })}
              className="flex-1 accent-fuchsia-400"
            />
            <span className="text-[10px] text-zinc-400 w-10 text-right tabular-nums">{contrast.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 w-14">Saturación</span>
            <input
              type="range" min={0} max={2.5} step={0.05}
              value={saturation}
              onChange={(e) => onUpdate({ saturation: parseFloat(e.target.value) })}
              className="flex-1 accent-fuchsia-400"
            />
            <span className="text-[10px] text-zinc-400 w-10 text-right tabular-nums">{saturation.toFixed(2)}</span>
          </div>
          {(brightness !== 0 || contrast !== 1 || saturation !== 1) && (
            <button
              onClick={() => onUpdate({ brightness: 0, contrast: 1, saturation: 1 })}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 self-end"
            >
              Restablecer color
            </button>
          )}
        </div>
      </Row>

      {/* Fade */}
      <Row label="Fade in / out (s)">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500">In</span>
            <input
              type="number" min={0} max={5} step={0.1}
              value={fadeIn.toFixed(1)}
              onChange={(e) => onUpdate({ fadeIn: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="flex-1 bg-zinc-950 border border-white/10 rounded-md px-2 py-1 text-xs text-white focus:border-fuchsia-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500">Out</span>
            <input
              type="number" min={0} max={5} step={0.1}
              value={fadeOut.toFixed(1)}
              onChange={(e) => onUpdate({ fadeOut: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="flex-1 bg-zinc-950 border border-white/10 rounded-md px-2 py-1 text-xs text-white focus:border-fuchsia-500 outline-none"
            />
          </div>
        </div>
      </Row>

      {/* Audio (solo video) */}
      {!isImage && (
        <Row label="Audio">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdate({ mute: !muted })}
              className={`
                shrink-0 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors
                ${muted ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}
              `}
            >
              {muted ? "Muteado" : "Mutear"}
            </button>
            <input
              type="range" min={0} max={2} step={0.05}
              disabled={muted}
              value={volume}
              onChange={(e) => onUpdate({ volume: parseFloat(e.target.value) })}
              className="flex-1 accent-cyan-400 disabled:opacity-40"
            />
            <span className="text-[10px] text-zinc-400 w-10 text-right tabular-nums">
              {muted ? "—" : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </Row>
      )}

      {/* Eliminar clip */}
      <button
        onClick={onRemove}
        className="mt-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-lg py-2 transition-colors"
      >
        Quitar clip del timeline
      </button>
    </aside>
  );
}
