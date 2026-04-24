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
        <span className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
          </svg>
        </span>
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Música</h3>
        <span className="text-xs text-zinc-500">
          {clips.length} {clips.length === 1 ? "pista" : "pistas"}
        </span>
      </div>

      <div className="bg-zinc-950/80 border border-white/5 rounded-xl p-3">
        {clips.length === 0 ? (
          <div className="flex items-center justify-center py-5 text-xs text-zinc-500 border border-dashed border-white/10 rounded-lg">
            Click en un archivo de audio en la biblioteca para agregarlo
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {clips.map((clip) => {
              const asset = assets.find((a) => a.id === clip.assetId);
              if (!asset) return null;
              return (
                <div
                  key={clip.id}
                  className="group flex items-center gap-3 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-transparent border border-cyan-500/20 rounded-lg px-3 py-2 hover:border-cyan-500/40 transition-colors"
                >
                  {/* Icono + waveform placeholder */}
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
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
                    <span className="text-[10px] text-zinc-400">Vol</span>
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={0.05}
                      value={clip.volume}
                      onChange={(e) => onChangeVolume(clip.id, parseFloat(e.target.value))}
                      className="w-20 accent-cyan-400"
                    />
                    <span className="text-[10px] text-zinc-300 w-8 tabular-nums">{Math.round(clip.volume * 100)}%</span>
                  </div>

                  {/* Eliminar */}
                  <button
                    onClick={() => onRemove(clip.id)}
                    className="shrink-0 w-7 h-7 rounded-full bg-white/5 hover:bg-red-600 text-zinc-400 hover:text-white text-sm flex items-center justify-center transition-colors"
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
