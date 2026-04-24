"use client";

import { useRef } from "react";
import type { Asset } from "@/types/project";
import { formatFileSize } from "@/lib/utils";

const ACCEPT = [
  "video/*",
  "image/*",
  "audio/*",
].join(",");

interface AssetLibraryProps {
  assets: Asset[];
  loading: boolean;
  onAddFiles: (files: File[]) => void;
  onRemoveAsset: (assetId: string) => void;
  onAddToTrack: (asset: Asset) => void;
}

function typeBadge(type: Asset["type"]) {
  if (type === "video") return { label: "Video",  classes: "bg-violet-500/20 text-violet-300 border-violet-500/30" };
  if (type === "image") return { label: "Imagen", classes: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30" };
  return                       { label: "Audio",  classes: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" };
}

function fmtDuration(sec?: number) {
  if (sec === undefined) return "";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AssetLibrary({
  assets,
  loading,
  onAddFiles,
  onRemoveAsset,
  onAddToTrack,
}: AssetLibraryProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onAddFiles(files);
    e.target.value = "";
  };

  return (
    <section className="bg-zinc-900/80 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
          <h2 className="text-sm font-bold text-white">Biblioteca</h2>
          <span className="text-xs text-zinc-500">{assets.length} {assets.length === 1 ? "archivo" : "archivos"}</span>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="text-xs font-medium px-3 py-1.5 rounded-lg
                     bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white
                     hover:from-violet-500 hover:to-fuchsia-500
                     shadow-md shadow-fuchsia-900/30 transition-colors"
        >
          + Subir archivos
        </button>
      </header>

      {assets.length === 0 ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 py-10 border border-dashed border-white/10 rounded-xl cursor-pointer hover:border-fuchsia-500/40 hover:bg-white/[0.02] transition-all"
        >
          <svg className="w-10 h-10 text-fuchsia-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <p className="text-sm text-zinc-400">Agregá videos, fotos o música</p>
          <p className="text-xs text-zinc-600">Después arrastralos al timeline</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {assets.map((asset) => {
            const badge = typeBadge(asset.type);
            const clickable = asset.type !== "audio" || true; // todos clickeables para agregar al track correspondiente
            return (
              <div
                key={asset.id}
                className="group relative bg-zinc-950 border border-white/5 rounded-xl overflow-hidden hover:border-fuchsia-500/40 transition-all"
              >
                {/* Thumb */}
                <button
                  onClick={() => clickable && onAddToTrack(asset)}
                  title={asset.type === "audio" ? "Agregar a pista de musica" : "Agregar al video"}
                  className="w-full aspect-video relative bg-zinc-800 flex items-center justify-center"
                >
                  {asset.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : asset.type === "audio" ? (
                    <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
                    </svg>
                  )}

                  {/* Overlay al hover con "+" */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-1 rounded-full">
                      + Agregar
                    </span>
                  </div>
                </button>

                {/* Info */}
                <div className="p-2 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badge.classes}`}>
                      {badge.label}
                    </span>
                    {asset.duration !== undefined && (
                      <span className="text-[10px] text-zinc-500">{fmtDuration(asset.duration)}</span>
                    )}
                    <span className="text-[10px] text-zinc-600 ml-auto">{formatFileSize(asset.size)}</span>
                  </div>
                  <p className="text-xs text-zinc-300 truncate" title={asset.name}>
                    {asset.name}
                  </p>
                </div>

                {/* Botón de eliminar */}
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveAsset(asset.id); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            );
          })}
          {loading && (
            <div className="aspect-video rounded-xl border border-dashed border-fuchsia-500/30 flex items-center justify-center">
              <span className="w-6 h-6 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={onInputChange}
      />
    </section>
  );
}
