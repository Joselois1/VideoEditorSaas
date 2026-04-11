"use client";

import { useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VideoUploader from "@/components/editor/VideoUploader";
import VideoPlayer from "@/components/editor/VideoPlayer";
import Toolbar from "@/components/editor/Toolbar";
import TrimPanel from "@/components/editor/panels/TrimPanel";
import SpeedPanel from "@/components/editor/panels/SpeedPanel";
import CropPanel from "@/components/editor/panels/CropPanel";
import AudioPanel from "@/components/editor/panels/AudioPanel";
import CompressPanel from "@/components/editor/panels/CompressPanel";
import FormatPanel from "@/components/editor/panels/FormatPanel";
import RotatePanel from "@/components/editor/panels/RotatePanel";
import ColorPanel from "@/components/editor/panels/ColorPanel";
import ReversePanel from "@/components/editor/panels/ReversePanel";
import VolumePanel from "@/components/editor/panels/VolumePanel";
import FadePanel from "@/components/editor/panels/FadePanel";
import LoopPanel from "@/components/editor/panels/LoopPanel";
import ExtractFramePanel from "@/components/editor/panels/ExtractFramePanel";
import GifPanel from "@/components/editor/panels/GifPanel";
import FpsPanel from "@/components/editor/panels/FpsPanel";
import JoinPanel from "@/components/editor/panels/JoinPanel";
import TextPanel from "@/components/editor/panels/TextPanel";
import NoisePanel from "@/components/editor/panels/NoisePanel";
import AdModal from "@/components/ads/AdModal";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { useVideoEditor } from "@/hooks/useVideoEditor";
import { processVideo } from "@/lib/ffmpeg/processor";
import { generateOutputFilename } from "@/lib/utils";
import type { ToolType } from "@/types/editor";

const OUTPUT_SUFFIX: Record<ToolType, string> = {
  trim: "trimmed", speed: "speed", crop: "cropped", audio: "audio",
  compress: "compressed", format: "converted", rotate: "rotated",
  color: "color", reverse: "reversed", volume: "volume", fade: "fade",
  loop: "loop", "extract-frame": "frame", gif: "gif", fps: "fps",
  join: "joined", text: "text", noise: "noise-reduced",
};

export default function EditorPage() {
  const { ffmpeg, load, isReady, isLoading } = useFFmpeg();
  const {
    state,
    loadVideo, setActiveTool,
    updateTrim, updateSpeed, updateCrop, updateAudio, updateCompress, updateFormat,
    updateRotate, updateColor, updateReverse, updateVolume, updateFade, updateLoop,
    updateExtractFrame, updateGif, updateFps, updateJoin, updateText, updateNoise,
    setProcessing, setOutputUrl, setError, reset,
  } = useVideoEditor();

  const [showAd, setShowAd] = useState(false);

  const handleFileSelected = useCallback(async (file: File) => {
    await loadVideo(file);
    if (!isReady && !isLoading) load();
  }, [loadVideo, isReady, isLoading, load]);

  // Procesar directo — sin anuncio, solo genera el preview
  const handleProcess = async () => {
    if (!ffmpeg || !state.video || !state.activeTool) return;
    if (state.activeTool === "join" && state.join.additionalFiles.length === 0) {
      setError("Agrega al menos un clip para unir.");
      return;
    }
    if (state.activeTool === "text" && !state.text.text.trim()) {
      setError("Escribe un texto antes de procesar.");
      return;
    }

    setProcessing(true, 0);
    try {
      const { url, isImage } = await processVideo(ffmpeg, state);
      setOutputUrl(url, isImage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el video.");
    }
  };

  // Descargar — muestra el anuncio y luego dispara la descarga
  const handleDownloadRequest = () => {
    if (!state.outputUrl) return;
    setShowAd(true);
  };

  const triggerDownload = () => {
    if (!state.outputUrl || !state.video) return;
    const suffix = OUTPUT_SUFFIX[state.activeTool ?? "trim"];
    let ext: string | undefined;
    if (state.activeTool === "extract-frame") ext = "png";
    if (state.activeTool === "gif")           ext = "gif";
    if (state.activeTool === "audio" && state.audio.extractOnly) ext = "mp3";
    if (state.activeTool === "format")        ext = state.format.target;

    const a = document.createElement("a");
    a.href = state.outputUrl;
    a.download = generateOutputFilename(state.video.name, suffix, ext);
    a.click();
  };

  const renderPanel = () => {
    const { video } = state;
    if (!video) return null;
    switch (state.activeTool) {
      case "trim":          return <TrimPanel duration={video.duration} settings={state.trim} onChange={updateTrim} />;
      case "speed":         return <SpeedPanel value={state.speed.value} onChange={updateSpeed} />;
      case "crop":          return <CropPanel videoWidth={video.width} videoHeight={video.height} settings={state.crop} onChange={updateCrop} />;
      case "audio":         return <AudioPanel settings={state.audio} onChange={updateAudio} />;
      case "compress":      return <CompressPanel settings={state.compress} onChange={updateCompress} />;
      case "format":        return <FormatPanel current={state.format.target} onChange={updateFormat} />;
      case "rotate":        return <RotatePanel settings={state.rotate} onChange={updateRotate} />;
      case "color":         return <ColorPanel settings={state.color} onChange={updateColor} />;
      case "reverse":       return <ReversePanel settings={state.reverse} onChange={updateReverse} duration={video.duration} />;
      case "volume":        return <VolumePanel settings={state.volume} onChange={updateVolume} />;
      case "fade":          return <FadePanel settings={state.fade} onChange={updateFade} duration={video.duration} />;
      case "loop":          return <LoopPanel settings={state.loop} onChange={updateLoop} duration={video.duration} />;
      case "extract-frame": return <ExtractFramePanel settings={state.extractFrame} onChange={updateExtractFrame} duration={video.duration} />;
      case "gif":           return <GifPanel settings={state.gif} onChange={updateGif} duration={video.duration} />;
      case "fps":           return <FpsPanel settings={state.fps} onChange={updateFps} />;
      case "join":          return <JoinPanel originalName={video.name} additionalFiles={state.join.additionalFiles} onChange={updateJoin} />;
      case "text":          return <TextPanel settings={state.text} onChange={updateText} duration={video.duration} />;
      case "noise":         return <NoisePanel settings={state.noise} onChange={updateNoise} />;
      default:              return null;
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {!state.video ? (
          <VideoUploader onFileSelected={handleFileSelected} />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h1 className="text-white font-semibold text-lg">Editor</h1>
              <Button variant="ghost" size="sm" onClick={reset}>&larr; Cambiar video</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Player column */}
              <div className="lg:col-span-2 flex flex-col gap-4">

                {/* Video / image preview */}
                {state.outputIsImage && state.outputUrl ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                      Frame capturado — listo para descargar
                    </div>
                    <div className="bg-black rounded-xl overflow-hidden aspect-video w-full flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={state.outputUrl} alt="Frame capturado" className="max-h-full max-w-full object-contain" />
                    </div>
                  </div>
                ) : (
                  <VideoPlayer
                    video={state.video}
                    previewUrl={state.outputUrl}
                  />
                )}

                {isLoading && <ProgressBar value={0} label="Cargando motor de video..." />}
                {state.isProcessing && <ProgressBar value={state.progress} label="Procesando video..." />}

                {state.error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                    {state.error}
                  </p>
                )}

                {/* Download bar — aparece cuando hay resultado */}
                {state.outputUrl && (
                  <div className="bg-zinc-900 border border-green-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                    <p className="text-sm text-zinc-400">
                      Revisa el resultado arriba y descargalo cuando estes listo.
                    </p>
                    <Button onClick={handleDownloadRequest} size="md">
                      Descargar
                    </Button>
                  </div>
                )}
              </div>

              {/* Tools column */}
              <div className="flex flex-col gap-4">
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
                  <Toolbar
                    activeTool={state.activeTool}
                    onToolSelect={(t: ToolType) => setActiveTool(t)}
                  />

                  {state.activeTool && (
                    <div className="border-t border-white/5 pt-4">
                      {renderPanel()}
                    </div>
                  )}

                  {state.activeTool && (
                    <Button
                      className="w-full mt-2"
                      loading={state.isProcessing}
                      disabled={!isReady || state.isProcessing}
                      onClick={handleProcess}
                    >
                      {state.isProcessing
                        ? "Procesando..."
                        : !isReady
                        ? "Cargando motor..."
                        : state.outputUrl
                        ? "Reprocesar"
                        : "Procesar"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {showAd && (
        <AdModal
          onComplete={() => { setShowAd(false); triggerDownload(); }}
          onClose={() => setShowAd(false)}
        />
      )}
    </>
  );
}
