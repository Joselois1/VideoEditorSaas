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
        <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h10a2 2 0 012 2v10H6a2 2 0 01-2-2V6zM18 4h2v2M20 4v10m0 6h-2" />
        </svg>
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Sobreimpresiones</h3>
        <span className="text-xs text-zinc-500">
          {clips.length} {clips.length === 1 ? "foto" : "fotos"}
        </span>
      </div>

      <div className="bg-zinc-950/60 border border-white/5 rounded-lg p-3">
        {clips.length === 0 ? (
          <div className="flex items-center justify-center py-5 text-xs text-zinc-500 border border-dashed border-white/10 rounded-md">
            Agregá imágenes como sobreimpresión desde la biblioteca
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {clips.map((clip) => {
              const asset = assets.find((a) => a.id === clip.assetId);
              if (!asset) return null;
              const selected = selectedOverlayId === clip.id;
              return (
                <button
                  key={clip.id}
                  onClick={() => onSelect(clip.id)}
                  className={`
                    group flex items-center gap-3 rounded-md px-3 py-2 transition-colors border text-left
                    ${selected
                      ? "bg-violet-500/10 border-violet-500/40"
                      : "bg-zinc-900/60 border-white/10 hover:border-white/20"
                    }
                  `}
                >
                  {/* Thumb */}
                  <div className="w-9 h-9 rounded-md bg-zinc-900 overflow-hidden shrink-0 border border-white/10">
                    {asset.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={asset.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 text-[9px]">IMG</div>
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
                    className="shrink-0 w-6 h-6 rounded-md hover:bg-red-600 text-zinc-500 hover:text-white text-sm flex items-center justify-center transition-colors cursor-pointer"
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
