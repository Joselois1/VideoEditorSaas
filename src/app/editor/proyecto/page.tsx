"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import AdModal from "@/components/ads/AdModal";
import AssetLibrary from "@/components/editor/project/AssetLibrary";
import VideoTimeline from "@/components/editor/project/VideoTimeline";
import AudioTimeline from "@/components/editor/project/AudioTimeline";
import OverlayTimeline from "@/components/editor/project/OverlayTimeline";
import ClipEffectsPanel from "@/components/editor/project/ClipEffectsPanel";
import OverlayEffectsPanel from "@/components/editor/project/OverlayEffectsPanel";
import AspectPresetSelector from "@/components/editor/project/AspectPresetSelector";
import { useProject } from "@/hooks/useProject";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { useAdGate } from "@/hooks/useAdGate";
import { getTimelineDuration } from "@/types/project";
import type { Asset } from "@/types/project";
import { renderProject, type RenderResult } from "@/lib/ffmpeg/projectRenderer";
import { formatFileSize } from "@/lib/utils";

export default function ProjectEditorPage() {
  const {
    project, loadingAssets, error, setError,
    addAssets, removeAsset,
    addVideoClip, removeVideoClip, reorderVideoTrack, updateClipEffects,
    addAudioClip, removeAudioClip, updateAudioClip,
    addOverlayClip, removeOverlayClip, updateOverlayClip,
    selectClip, selectOverlay,
    setAspect, setMaxHeight, setPreviewMode,
  } = useProject();

  const { ffmpeg, load, isReady, isLoading } = useFFmpeg();
  const renderAd = useAdGate();
  const downloadAd = useAdGate();

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState<"preparing" | "processing">("preparing");
  const [result, setResult] = useState<RenderResult | null>(null);

  // Precarga FFmpeg apenas entra a la pagina — ~30 MB de descarga que sucede
  // en paralelo mientras el usuario arma su proyecto.
  useEffect(() => {
    if (!isReady && !isLoading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Acciones ───────────────────────────────────────────────────────────────

  const handleAddFiles = useCallback(async (files: File[]) => {
    if (!isReady && !isLoading) load();
    await addAssets(files);
  }, [addAssets, isLoading, isReady, load]);

  const handleAddToTrack = (asset: Asset) => {
    if (asset.type === "audio") addAudioClip(asset.id);
    else addVideoClip(asset.id);
  };

  const clearResult = useCallback(() => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
  }, [result]);

  const doRender = useCallback(async () => {
    if (!ffmpeg) { setError("El motor de video no está listo."); return; }
    clearResult();
    setIsRendering(true);
    setRenderProgress(0);
    setRenderStage("preparing");

    // conectamos progress de ffmpeg
    const onProgress = ({ progress }: { progress: number }) => {
      setRenderStage("processing");
      setRenderProgress(Math.round(progress * 100));
    };
    ffmpeg.on("progress", onProgress);

    try {
      const r = await renderProject(ffmpeg, project);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al renderizar el proyecto.");
    } finally {
      ffmpeg.off("progress", onProgress);
      setIsRendering(false);
    }
  }, [ffmpeg, project, setError, clearResult]);

  const handleRenderClick = () => {
    if (project.videoTrack.length === 0) {
      setError("Agregá al menos un clip al track de video antes de renderizar.");
      return;
    }
    if (!isReady) {
      // todavia cargando el motor — encolamos render tras ad
      renderAd.request(() => {
        const waitAndRender = () => {
          if (!isReady) setTimeout(waitAndRender, 300);
          else doRender();
        };
        waitAndRender();
      });
      return;
    }
    renderAd.request(doRender);
  };

  const handleDownloadClick = () => {
    if (!result) return;
    downloadAd.request(() => {
      const a = document.createElement("a");
      a.href = result.url;
      a.download = `proyecto_${Date.now()}.mp4`;
      a.click();
    });
  };

  // ── Derivados ─────────────────────────────────────────────────────────────

  const totalDuration = getTimelineDuration(project);
  const hasVideo = project.videoTrack.length > 0;
  const selectedClip = project.videoTrack.find((c) => c.id === project.selectedClipId);
  const selectedClipAsset = selectedClip
    ? project.assets.find((a) => a.id === selectedClip.assetId)
    : null;
  const selectedOverlay = project.overlayTrack.find((o) => o.id === project.selectedOverlayId);
  const selectedOverlayAsset = selectedOverlay
    ? project.assets.find((a) => a.id === selectedOverlay.assetId)
    : null;

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
              <Button variant="ghost" size="sm">&larr; Editor rápido</Button>
            </Link>
            <Button
              variant="gradient"
              size="md"
              loading={isRendering}
              disabled={!hasVideo || isRendering}
              onClick={handleRenderClick}
            >
              {isRendering
                ? `Renderizando... ${renderProgress}%`
                : !isReady
                ? "Cargando motor..."
                : result
                ? "Re-renderizar"
                : "Renderizar"}
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

        {/* Progress */}
        {(isLoading || isRendering) && (
          <ProgressBar
            value={isRendering ? renderProgress : 0}
            label={
              !isRendering
                ? "Cargando motor de video..."
                : renderStage === "preparing"
                ? "Preparando archivos..."
                : "Procesando video..."
            }
          />
        )}

        {/* Layout principal: preview+biblioteca+timeline (izq) + panel (der) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
          <div className="flex flex-col gap-5 min-w-0">
            {/* Preview */}
            <section className="bg-zinc-900/80 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-fuchsia-500/5 to-orange-500/5 pointer-events-none" />

              {result ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/60" />
                    <p className="text-sm font-semibold text-white">Render listo</p>
                    {result.quality === "preview" ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                        ⚡ Preview {result.height}p
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Calidad final {result.height}p
                      </span>
                    )}
                    <span className="text-xs text-zinc-500 ml-auto">
                      {formatFileSize(result.size)} • {result.duration.toFixed(1)}s
                    </span>
                  </div>
                  <div className="bg-black rounded-xl overflow-hidden aspect-video w-full">
                    <video
                      src={result.url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Aviso de preview — ofrece re-renderizar en alta calidad */}
                  {result.quality === "preview" && (
                    <div className="flex items-center justify-between gap-3 text-xs bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-lg px-3 py-2">
                      <p className="text-zinc-300">
                        Este preview es de baja calidad. Desactivá <strong className="text-fuchsia-300">Preview rápido</strong> y re-renderizá para la descarga final.
                      </p>
                      <button
                        onClick={() => {
                          setPreviewMode(false);
                          clearResult();
                        }}
                        className="shrink-0 text-fuchsia-300 hover:text-white font-semibold whitespace-nowrap"
                      >
                        Apagar preview →
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <Button variant="ghost" size="sm" onClick={clearResult}>
                      &larr; Seguir editando
                    </Button>
                    <Button variant="gradient" size="md" onClick={handleDownloadClick}>
                      Descargar MP4
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative text-center py-10">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-500 flex items-center justify-center mb-3 shadow-lg shadow-fuchsia-500/30">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-white">Preview del proyecto</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {hasVideo
                      ? "Apretá Renderizar para generar el resultado."
                      : "Agregá clips a la timeline para empezar."}
                  </p>
                </div>
              )}
            </section>

            <AssetLibrary
              assets={project.assets}
              loading={loadingAssets}
              onAddFiles={handleAddFiles}
              onRemoveAsset={removeAsset}
              onAddToTrack={handleAddToTrack}
              onAddAsOverlay={(asset) => addOverlayClip(asset.id)}
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

              <OverlayTimeline
                clips={project.overlayTrack}
                assets={project.assets}
                selectedOverlayId={project.selectedOverlayId}
                onSelect={selectOverlay}
                onRemove={removeOverlayClip}
              />

              <AudioTimeline
                clips={project.audioTrack}
                assets={project.assets}
                onRemove={removeAudioClip}
                onChangeVolume={(id, volume) => updateAudioClip(id, { volume })}
              />
            </section>
          </div>

          {/* Panel lateral: efectos del elemento seleccionado + aspect presets */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-16">
            {selectedOverlay && selectedOverlayAsset ? (
              <OverlayEffectsPanel
                clip={selectedOverlay}
                asset={selectedOverlayAsset}
                timelineDuration={totalDuration}
                onUpdate={(patch) => updateOverlayClip(selectedOverlay.id, patch)}
                onClose={() => selectOverlay(null)}
                onRemove={() => removeOverlayClip(selectedOverlay.id)}
              />
            ) : selectedClip && selectedClipAsset ? (
              <ClipEffectsPanel
                clip={selectedClip}
                asset={selectedClipAsset}
                onUpdate={(patch) => updateClipEffects(selectedClip.id, patch)}
                onClose={() => selectClip(null)}
                onRemove={() => removeVideoClip(selectedClip.id)}
              />
            ) : (
              <div className="bg-zinc-900/80 border border-dashed border-white/10 rounded-2xl p-5 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-orange-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <p className="text-xs text-zinc-400">
                  Seleccioná un clip o sobreimpresión<br />para editar sus propiedades
                </p>
              </div>
            )}

            <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-4">
              <AspectPresetSelector
                aspect={project.output.aspect}
                maxHeight={project.output.maxHeight}
                previewMode={project.output.previewMode}
                onAspectChange={setAspect}
                onHeightChange={setMaxHeight}
                onPreviewModeChange={setPreviewMode}
              />
            </div>
          </aside>
        </div>
      </main>
      <Footer />

      {/* Ad modals: uno para render, otro para descarga. Ambos con cooldown de 60s. */}
      {renderAd.showAd && (
        <AdModal onComplete={renderAd.onComplete} onClose={renderAd.onClose} />
      )}
      {downloadAd.showAd && (
        <AdModal onComplete={downloadAd.onComplete} onClose={downloadAd.onClose} />
      )}
    </>
  );
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
