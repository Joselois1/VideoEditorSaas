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
  const [renderElapsed, setRenderElapsed] = useState(0);    // segundos transcurridos
  const [renderEta, setRenderEta] = useState<number | null>(null);
  const [lastRenderMs, setLastRenderMs] = useState<number | null>(null);
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
    setRenderElapsed(0);
    setRenderEta(null);
    setLastRenderMs(null);

    const startedAt = Date.now();

    // Actualiza "elapsed" cada segundo mientras dure el render.
    const elapsedTimer = setInterval(() => {
      setRenderElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    // conectamos progress de ffmpeg y calculamos ETA
    const onProgress = ({ progress }: { progress: number }) => {
      setRenderStage("processing");
      const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
      setRenderProgress(pct);

      // ETA basado en progreso lineal; solo confiable despues del ~3%
      if (progress > 0.03) {
        const elapsed = (Date.now() - startedAt) / 1000;
        const totalEstimate = elapsed / progress;
        const remaining = Math.max(0, totalEstimate - elapsed);
        setRenderEta(remaining);
      }
    };
    ffmpeg.on("progress", onProgress);

    try {
      const r = await renderProject(ffmpeg, project);
      setLastRenderMs(Date.now() - startedAt);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al renderizar el proyecto.");
    } finally {
      clearInterval(elapsedTimer);
      ffmpeg.off("progress", onProgress);
      setIsRendering(false);
      setRenderEta(null);
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
            <span className="w-0.5 h-8 rounded-full bg-violet-500" />
            <div>
              <h1 className="text-white font-semibold text-lg leading-tight flex items-center gap-2">
                Proyecto
                <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
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
          <div className="flex flex-col gap-1">
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
            {isRendering && (
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>Transcurrido: {formatDuration(renderElapsed)}</span>
                {renderEta !== null ? (
                  <span>Faltan aprox. {formatDuration(Math.round(renderEta))}</span>
                ) : (
                  <span>Estimando tiempo...</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Layout principal: preview+biblioteca+timeline (izq) + panel (der) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
          <div className="flex flex-col gap-5 min-w-0">
            {/* Preview */}
            <section className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
              {result ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <p className="text-sm font-medium text-white">Render listo</p>
                    {result.quality === "preview" ? (
                      <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                        Preview {result.height}p
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Final {result.height}p
                      </span>
                    )}
                    <span className="text-xs text-zinc-500 ml-auto">
                      {formatFileSize(result.size)} • {result.duration.toFixed(1)}s
                      {lastRenderMs !== null && (
                        <> • renderizado en {formatDuration(Math.round(lastRenderMs / 1000))}</>
                      )}
                    </span>
                  </div>
                  <div className="bg-black rounded-md overflow-hidden aspect-video w-full border border-white/5">
                    <video
                      src={result.url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Aviso de preview — ofrece re-renderizar en alta calidad */}
                  {result.quality === "preview" && (
                    <div className="flex items-center justify-between gap-3 text-xs bg-white/[0.03] border border-white/10 rounded-md px-3 py-2">
                      <p className="text-zinc-400">
                        Este preview es de baja calidad. Desactivá <span className="text-violet-300">Preview rápido</span> y re-renderizá para la descarga final.
                      </p>
                      <button
                        onClick={() => {
                          setPreviewMode(false);
                          clearResult();
                        }}
                        className="shrink-0 text-violet-300 hover:text-white font-medium whitespace-nowrap"
                      >
                        Apagar preview →
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <Button variant="ghost" size="sm" onClick={clearResult}>
                      &larr; Seguir editando
                    </Button>
                    <Button size="md" onClick={handleDownloadClick}>
                      Descargar MP4
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-12 h-12 mx-auto rounded-md bg-white/[0.03] border border-white/10 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white">Preview del proyecto</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {hasVideo
                      ? "Apretá Renderizar para generar el resultado."
                      : "Agregá clips a la timeline para empezar."}
                  </p>
                  {hasVideo && (
                    <p className="text-[11px] text-zinc-600 mt-3 max-w-md mx-auto leading-relaxed">
                      El render corre entero en tu navegador. Para videos de 1+ minuto puede tardar
                      varios minutos &mdash; mantené la pestaña abierta. {project.output.previewMode
                        ? "Estás en modo preview (480p, más rápido)."
                        : "Activá \"Preview rápido\" para iterar mucho más rápido."}
                    </p>
                  )}
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
            <section className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Timeline</h2>
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
              <div className="bg-zinc-900/40 border border-dashed border-white/10 rounded-xl p-5 text-center">
                <div className="w-9 h-9 mx-auto mb-2 rounded-md bg-white/[0.03] border border-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <p className="text-xs text-zinc-500">
                  Seleccioná un clip o sobreimpresión<br />para editar sus propiedades
                </p>
              </div>
            )}

            <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4">
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
