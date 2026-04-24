"use client";

import type { Asset, AudioClip } from "@/types/project";

interface AudioTimelineProps {
  clips: AudioClip[];
  assets: Asset[];
  onRemove: (clipId: string) => void;
  onChangeVolume: (clipId: string, volume: number) => void;
}

function fmtSecs(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function AudioTimeline({
  clips, assets, onRemove, onChangeVolume,
}: AudioTimelineProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
        </svg>
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Música</h3>
        <span className="text-xs text-zinc-500">
          {clips.length} {clips.length === 1 ? "pista" : "pistas"}
        </span>
      </div>

      <div className="bg-zinc-950/60 border border-white/5 rounded-lg p-3">
        {clips.length === 0 ? (
          <div className="flex items-center justify-center py-5 text-xs text-zinc-500 border border-dashed border-white/10 rounded-md">
            Click en un archivo de audio en la biblioteca para agregarlo
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {clips.map((clip) => {
              const asset = assets.find((a) => a.id === clip.assetId);
              if (!asset) return null;
              return (
                <div
                  key={clip.id}
                  className="group flex items-center gap-3 bg-zinc-900/60 border border-white/10 rounded-md px-3 py-2 hover:border-white/20 transition-colors"
                >
                  {/* Icono + waveform placeholder */}
                  <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                      <path d="M4 12h2M8 8v8M12 4v16M16 8v8M20 12h-2" />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {asset.duration !== undefined && `${fmtSecs(asset.duration)} • `}
                      Inicio: {fmtSecs(clip.startAt)}
                    </p>
                  </div>

                  {/* Volumen */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-zinc-500">Vol</span>
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={0.05}
                      value={clip.volume}
                      onChange={(e) => onChangeVolume(clip.id, parseFloat(e.target.value))}
                      className="w-20 accent-violet-500"
                    />
                    <span className="text-[10px] text-zinc-400 w-8 tabular-nums">{Math.round(clip.volume * 100)}%</span>
                  </div>

                  {/* Eliminar */}
                  <button
                    onClick={() => onRemove(clip.id)}
                    className="shrink-0 w-6 h-6 rounded-md hover:bg-red-600 text-zinc-500 hover:text-white text-sm flex items-center justify-center transition-colors"
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
