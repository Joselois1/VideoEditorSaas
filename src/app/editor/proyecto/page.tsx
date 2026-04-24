"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import AssetLibrary from "@/components/editor/project/AssetLibrary";
import VideoTimeline from "@/components/editor/project/VideoTimeline";
import AudioTimeline from "@/components/editor/project/AudioTimeline";
import { useProject } from "@/hooks/useProject";
import { getTimelineDuration } from "@/types/project";
import type { Asset } from "@/types/project";

export default function ProjectEditorPage() {
  const {
    project, loadingAssets, error, setError,
    addAssets, removeAsset,
    addVideoClip, removeVideoClip, reorderVideoTrack,
    addAudioClip, removeAudioClip, updateAudioClip,
    selectClip,
  } = useProject();

  const handleAddToTrack = (asset: Asset) => {
    if (asset.type === "audio") addAudioClip(asset.id);
    else addVideoClip(asset.id);
  };

  const totalDuration = getTimelineDuration(project);
  const hasTimeline = project.videoTrack.length > 0 || project.audioTrack.length > 0;

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col gap-5">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-violet-500 via-fuchsia-500 to-orange-500" />
            <div>
              <h1 className="text-white font-bold text-xl leading-tight flex items-center gap-2">
                Proyecto
                <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300">
                  Beta
                </span>
              </h1>
              <p className="text-xs text-zinc-500">
                Combiná varios clips, fotos y música en una sola edición.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/editor">
              <Button variant="ghost" size="sm">
                &larr; Editor rápido
              </Button>
            </Link>
            <Button variant="gradient" size="md" disabled>
              Renderizar (próximamente)
            </Button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start justify-between gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
            <p className="text-sm text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="text-red-300 hover:text-white text-lg leading-none">×</button>
          </div>
        )}

        {/* Preview placeholder */}
        <section className="bg-zinc-900/80 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 min-h-[280px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-fuchsia-500/5 to-orange-500/5 pointer-events-none" />
          <div className="relative text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-500 flex items-center justify-center mb-3 shadow-lg shadow-fuchsia-500/30">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">Preview del proyecto</p>
            <p className="text-xs text-zinc-500 mt-1">
              {hasTimeline
                ? "Renderizá para ver el resultado — próximamente en la siguiente actualización."
                : "Agregá clips y música para empezar."}
            </p>
          </div>
        </section>

        {/* Biblioteca */}
        <AssetLibrary
          assets={project.assets}
          loading={loadingAssets}
          onAddFiles={addAssets}
          onRemoveAsset={removeAsset}
          onAddToTrack={handleAddToTrack}
        />

        {/* Timelines */}
        <section className="bg-zinc-900/80 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-gradient-to-b from-fuchsia-500 to-orange-500" />
              <h2 className="text-sm font-bold text-white">Timeline</h2>
            </div>
            <span className="text-xs text-zinc-500">
              Duración total: <span className="text-zinc-300 font-medium">{formatDuration(totalDuration)}</span>
            </span>
          </div>

          <VideoTimeline
            clips={project.videoTrack}
            assets={project.assets}
            selectedClipId={project.selectedClipId}
            totalDuration={totalDuration}
            onReorder={reorderVideoTrack}
            onSelect={selectClip}
            onRemove={removeVideoClip}
          />

          <AudioTimeline
            clips={project.audioTrack}
            assets={project.assets}
            onRemove={removeAudioClip}
            onChangeVolume={(id, volume) => updateAudioClip(id, { volume })}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
