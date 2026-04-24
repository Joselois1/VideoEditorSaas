"use client";

import type { Asset, OverlayClip } from "@/types/project";

interface OverlayTimelineProps {
  clips: OverlayClip[];
  assets: Asset[];
  selectedOverlayId: string | null;
  onSelect: (clipId: string) => void;
  onRemove: (clipId: string) => void;
}

function fmtSecs(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function OverlayTimeline({
  clips, assets, selectedOverlayId, onSelect, onRemove,
}: OverlayTimelineProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h10a2 2 0 012 2v10H6a2 2 0 01-2-2V6zM18 4h2v2M20 4v10m0 6h-2" />
          </svg>
        </span>
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sobreimpresiones</h3>
        <span className="text-xs text-zinc-500">
          {clips.length} {clips.length === 1 ? "foto" : "fotos"}
        </span>
      </div>

      <div className="bg-zinc-950/80 border border-white/5 rounded-xl p-3">
        {clips.length === 0 ? (
          <div className="flex items-center justify-center py-5 text-xs text-zinc-500 border border-dashed border-white/10 rounded-lg">
            Agregá imágenes como sobreimpresión desde la biblioteca
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {clips.map((clip) => {
              const asset = assets.find((a) => a.id === clip.assetId);
              if (!asset) return null;
              const selected = selectedOverlayId === clip.id;
              return (
                <button
                  key={clip.id}
                  onClick={() => onSelect(clip.id)}
                  className={`
                    group flex items-center gap-3 rounded-lg px-3 py-2 transition-all border text-left
                    ${selected
                      ? "bg-gradient-to-r from-fuchsia-500/15 via-rose-500/10 to-transparent border-fuchsia-500/50 shadow-md shadow-fuchsia-500/20"
                      : "bg-gradient-to-r from-fuchsia-500/5 to-transparent border-fuchsia-500/20 hover:border-fuchsia-500/40"
                    }
                  `}
                >
                  {/* Thumb */}
                  <div className="w-10 h-10 rounded-md bg-zinc-900 overflow-hidden shrink-0 border border-white/10">
                    {asset.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={asset.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-fuchsia-400 text-[9px]">IMG</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 flex items-center gap-2">
                      <span>
                        {fmtSecs(clip.startAt)} → {fmtSecs(clip.endAt)}
                      </span>
                      <span className="w-px h-2.5 bg-white/10" />
                      <span className="capitalize">{clip.position.replace("-", " ")}</span>
                      <span className="w-px h-2.5 bg-white/10" />
                      <span>{clip.size === "small" ? "S" : clip.size === "medium" ? "M" : "L"}</span>
                    </p>
                  </div>

                  {/* Eliminar */}
                  <span
                    onClick={(e) => { e.stopPropagation(); onRemove(clip.id); }}
                    className="shrink-0 w-7 h-7 rounded-full bg-white/5 hover:bg-red-600 text-zinc-400 hover:text-white text-sm flex items-center justify-center transition-colors cursor-pointer"
                    title="Eliminar"
                  >
                    ×
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
