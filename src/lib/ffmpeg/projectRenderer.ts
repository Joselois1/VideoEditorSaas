import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import type {
  Project, Asset, VideoClip, AudioClip, OverlayClip,
  AspectPreset, OverlayPosition, OverlaySize,
} from "@/types/project";
import { getEffectiveDuration, IMAGE_DEFAULT_DURATION } from "@/types/project";

// ── Overlays: helpers ────────────────────────────────────────────────────────
const OVERLAY_PADDING = 20;

function overlayPositionExpr(pos: OverlayPosition): { x: string; y: string } {
  const p = OVERLAY_PADDING;
  switch (pos) {
    case "top-left":      return { x: `${p}`,          y: `${p}`         };
    case "top-center":    return { x: "(W-w)/2",       y: `${p}`         };
    case "top-right":     return { x: `W-w-${p}`,      y: `${p}`         };
    case "center-left":   return { x: `${p}`,          y: "(H-h)/2"      };
    case "center":        return { x: "(W-w)/2",       y: "(H-h)/2"      };
    case "center-right":  return { x: `W-w-${p}`,      y: "(H-h)/2"      };
    case "bottom-left":   return { x: `${p}`,          y: `H-h-${p}`     };
    case "bottom-center": return { x: "(W-w)/2",       y: `H-h-${p}`     };
    case "bottom-right":  return { x: `W-w-${p}`,      y: `H-h-${p}`     };
  }
}

function overlayWidthPx(size: OverlaySize, targetW: number): number {
  const ratio = size === "small" ? 0.2 : size === "medium" ? 0.35 : 0.5;
  let w = Math.round(targetW * ratio);
  if (w % 2) w += 1;
  return w;
}

// ── Output resolution by aspect preset ───────────────────────────────────────
// Resolucion = maxHeight, el ancho se calcula segun aspect.
function computeTargetSize(aspect: AspectPreset, maxHeight: number, firstVideo?: Asset) {
  let w: number, h: number;
  switch (aspect) {
    case "9:16": w = Math.round(maxHeight * 9 / 16);  h = maxHeight; break;
    case "16:9": w = maxHeight;                        h = Math.round(maxHeight * 9 / 16); break;
    case "1:1":  w = maxHeight;                        h = maxHeight; break;
    case "4:5":  w = Math.round(maxHeight * 4 / 5);    h = maxHeight; break;
    case "original":
    default: {
      if (firstVideo?.width && firstVideo?.height) {
        const ratio = firstVideo.width / firstVideo.height;
        h = Math.min(maxHeight, firstVideo.height);
        w = Math.round(h * ratio);
      } else {
        w = Math.round(maxHeight * 16 / 9);
        h = maxHeight;
      }
    }
  }
  // forzar pares (H.264 lo requiere)
  if (w % 2) w += 1;
  if (h % 2) h += 1;
  return { w, h };
}

// atempo admite 0.5..2 — para valores fuera de rango, encadenar
function atempoChain(speed: number): string {
  if (speed === 1) return "";
  const filters: string[] = [];
  let remaining = speed;
  while (remaining > 2)   { filters.push("atempo=2.0");  remaining /= 2; }
  while (remaining < 0.5) { filters.push("atempo=0.5");  remaining *= 2; }
  if (Math.abs(remaining - 1) > 0.001) filters.push(`atempo=${remaining.toFixed(4)}`);
  return filters.join(",");
}

interface BuiltInput {
  args: string[];
  index: number;        // index de este input en el comando ffmpeg
}

function buildClipVideoFilter(
  clip: VideoClip,
  asset: Asset,
  inputIndex: number,
  vLabel: string,
  targetW: number,
  targetH: number,
): { filter: string; outLabel: string; effectiveDuration: number } {
  const effDur = getEffectiveDuration(clip, asset);
  const parts: string[] = [];

  // Video de entrada
  parts.push(`[${inputIndex}:v]`);

  // Ajustes propios del clip (video, no aplican a imagen por logica)
  if (asset.type === "video") {
    // trim (si aplica)
    if (clip.effects.trim) {
      parts.push(`trim=start=${clip.effects.trim.start}:end=${clip.effects.trim.end},`);
    }
    // setpts para reset de timestamps + speed
    const speed = clip.effects.speed ?? 1;
    parts.push(`setpts=(PTS-STARTPTS)/${speed.toFixed(4)},`);
  } else {
    // image: reset PTS
    parts.push(`setpts=PTS-STARTPTS,`);
  }

  // rotacion y flips
  if (clip.effects.rotation === 90)  parts.push("transpose=1,");
  if (clip.effects.rotation === 180) parts.push("transpose=2,transpose=2,");
  if (clip.effects.rotation === 270) parts.push("transpose=2,");
  if (clip.effects.flipH)            parts.push("hflip,");
  if (clip.effects.flipV)            parts.push("vflip,");

  // color eq
  const { brightness = 0, contrast = 1, saturation = 1 } = clip.effects;
  if (brightness !== 0 || contrast !== 1 || saturation !== 1) {
    parts.push(`eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation},`);
  }

  // fades
  if (clip.effects.fadeIn && clip.effects.fadeIn > 0) {
    parts.push(`fade=in:st=0:d=${clip.effects.fadeIn},`);
  }
  if (clip.effects.fadeOut && clip.effects.fadeOut > 0) {
    const st = Math.max(0, effDur - clip.effects.fadeOut);
    parts.push(`fade=out:st=${st.toFixed(3)}:d=${clip.effects.fadeOut},`);
  }

  // normalizacion: scale + pad + setsar + fps
  parts.push(
    `scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease,`,
    `pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2:color=black,`,
    `setsar=1,fps=30,format=yuv420p`,
  );

  parts.push(`[${vLabel}]`);
  return { filter: parts.join(""), outLabel: vLabel, effectiveDuration: effDur };
}

function buildClipAudioFilter(
  clip: VideoClip,
  asset: Asset,
  inputIndex: number,
  aLabel: string,
  effectiveDuration: number,
): string {
  // Si es imagen o el clip esta muteado o el video no tiene audio,
  // generamos audio silencioso del mismo largo que el video.
  const muted = clip.effects.mute === true;
  const isImage = asset.type === "image";

  if (isImage || muted) {
    return `anullsrc=r=44100:cl=stereo,atrim=duration=${effectiveDuration.toFixed(3)},asetpts=PTS-STARTPTS[${aLabel}]`;
  }

  const parts: string[] = [`[${inputIndex}:a]`];

  if (clip.effects.trim) {
    parts.push(`atrim=start=${clip.effects.trim.start}:end=${clip.effects.trim.end},`);
  }
  parts.push("asetpts=PTS-STARTPTS,");

  const speed = clip.effects.speed ?? 1;
  const atempo = atempoChain(speed);
  if (atempo) parts.push(`${atempo},`);

  const vol = clip.effects.volume ?? 1;
  if (vol !== 1) parts.push(`volume=${vol.toFixed(3)},`);

  if (clip.effects.fadeIn && clip.effects.fadeIn > 0) {
    parts.push(`afade=in:st=0:d=${clip.effects.fadeIn},`);
  }
  if (clip.effects.fadeOut && clip.effects.fadeOut > 0) {
    const st = Math.max(0, effectiveDuration - clip.effects.fadeOut);
    parts.push(`afade=out:st=${st.toFixed(3)}:d=${clip.effects.fadeOut},`);
  }

  // aresample para asegurar tasa consistente antes del concat
  parts.push("aresample=44100");
  parts.push(`[${aLabel}]`);
  return parts.join("");
}

function buildAudioBgFilter(
  clip: AudioClip,
  asset: Asset,
  inputIndex: number,
  aLabel: string,
): string {
  const parts: string[] = [`[${inputIndex}:a]`];
  if (clip.trim) {
    parts.push(`atrim=start=${clip.trim.start}:end=${clip.trim.end},`);
  }
  parts.push("asetpts=PTS-STARTPTS,");

  if (clip.volume !== 1) parts.push(`volume=${clip.volume.toFixed(3)},`);

  if (clip.fadeIn && clip.fadeIn > 0) {
    parts.push(`afade=in:st=0:d=${clip.fadeIn},`);
  }
  if (clip.fadeOut && clip.fadeOut > 0) {
    const audioDur = clip.trim
      ? clip.trim.end - clip.trim.start
      : asset.duration ?? 0;
    const st = Math.max(0, audioDur - clip.fadeOut);
    parts.push(`afade=out:st=${st.toFixed(3)}:d=${clip.fadeOut},`);
  }

  if (clip.startAt > 0) {
    const ms = Math.round(clip.startAt * 1000);
    parts.push(`adelay=${ms}|${ms},`);
  }

  parts.push("aresample=44100");
  parts.push(`[${aLabel}]`);
  return parts.join("");
}

export interface RenderResult {
  url: string;
  size: number;
  duration: number;
  mimeType: string;
  quality: "preview" | "final";                // en que modo se renderizo
  width: number;
  height: number;
}

export async function renderProject(
  ffmpeg: FFmpeg,
  project: Project,
): Promise<RenderResult> {
  if (project.videoTrack.length === 0) {
    throw new Error("Agregá al menos un clip al track de video para renderizar.");
  }

  // ── Resolucion de salida ────────────────────────────────────────────────────
  // Preview mode override: 480p + CRF 30 para iteracion rapida.
  const isPreview = project.output.previewMode === true;
  const effectiveMaxHeight = isPreview ? 480 : project.output.maxHeight;
  const effectiveCrf = isPreview ? "30" : "23";

  const firstVideoAsset = project.videoTrack
    .map((c) => project.assets.find((a) => a.id === c.assetId))
    .find((a) => a?.type === "video");
  const { w: targetW, h: targetH } = computeTargetSize(
    project.output.aspect,
    effectiveMaxHeight,
    firstVideoAsset,
  );

  // ── Preparar archivos: leer todos los assets en paralelo y escribirlos a FS
  const inputArgs: string[] = [];
  const builtInputs: BuiltInput[] = [];
  const filesToClean: string[] = [];
  let inputIndex = 0;
  const assetFiles = new Map<string, string>();

  // Recolectar IDs de assets unicos referenciados por cualquier track
  const referencedAssetIds = new Set<string>();
  project.videoTrack.forEach((c) => referencedAssetIds.add(c.assetId));
  project.audioTrack.forEach((c) => referencedAssetIds.add(c.assetId));
  project.overlayTrack.forEach((c) => referencedAssetIds.add(c.assetId));

  // Leer binarios en paralelo (este es el paso lento para archivos grandes)
  const assetDatas = await Promise.all(
    Array.from(referencedAssetIds).map(async (id) => {
      const asset = project.assets.find((a) => a.id === id);
      if (!asset) return null;
      return { id, asset, data: await fetchFile(asset.file) };
    }),
  );

  // Escribir secuencialmente al FS virtual de FFmpeg (barato, memoria)
  for (const entry of assetDatas) {
    if (!entry) continue;
    const { id, asset, data } = entry;
    const ext = asset.name.split(".").pop()
      ?? (asset.type === "image" ? "png" : asset.type === "audio" ? "mp3" : "mp4");
    const name = `asset_${id}.${ext}`;
    await ffmpeg.writeFile(name, data);
    assetFiles.set(id, name);
    filesToClean.push(name);
  }

  // Inputs de la video track (imagenes con -loop 1 -t)
  for (const clip of project.videoTrack) {
    const asset = project.assets.find((a) => a.id === clip.assetId);
    if (!asset) throw new Error("Asset referenciado no existe");
    const fileName = assetFiles.get(asset.id)!;
    if (asset.type === "image") {
      const dur = clip.effects.imageDuration ?? IMAGE_DEFAULT_DURATION;
      inputArgs.push("-loop", "1", "-t", dur.toFixed(3), "-i", fileName);
    } else {
      inputArgs.push("-i", fileName);
    }
    builtInputs.push({ args: [], index: inputIndex });
    inputIndex++;
  }

  // Inputs de la audio track
  const audioTrackInputIndices: number[] = [];
  for (const aclip of project.audioTrack) {
    const fileName = assetFiles.get(aclip.assetId);
    if (!fileName) continue;
    inputArgs.push("-i", fileName);
    audioTrackInputIndices.push(inputIndex);
    inputIndex++;
  }

  // Inputs de la overlay track (-loop 1 para que el frame dure toda la timeline;
  // overlay=enable= controla cuando se dibuja).
  const overlayInputIndices: number[] = [];
  for (const ov of project.overlayTrack) {
    const asset = project.assets.find((a) => a.id === ov.assetId);
    const fileName = asset && asset.type === "image" ? assetFiles.get(asset.id) : undefined;
    if (!fileName) {
      overlayInputIndices.push(-1);
      continue;
    }
    inputArgs.push("-loop", "1", "-i", fileName);
    overlayInputIndices.push(inputIndex);
    inputIndex++;
  }

  // ── Construir filter_complex ────────────────────────────────────────────────
  const filters: string[] = [];

  // Per-clip video + audio
  project.videoTrack.forEach((clip, i) => {
    const asset = project.assets.find((a) => a.id === clip.assetId)!;
    const vBuilt = buildClipVideoFilter(clip, asset, i, `v${i}`, targetW, targetH);
    filters.push(vBuilt.filter);
    filters.push(buildClipAudioFilter(clip, asset, i, `a${i}`, vBuilt.effectiveDuration));
  });

  // Concat
  const concatSrc = project.videoTrack.map((_, i) => `[v${i}][a${i}]`).join("");
  filters.push(
    `${concatSrc}concat=n=${project.videoTrack.length}:v=1:a=1[vout][amain]`,
  );

  // Audio track overlays -> amix con amain
  let finalAudioLabel = "amain";
  if (project.audioTrack.length > 0) {
    project.audioTrack.forEach((aclip, i) => {
      const asset = project.assets.find((a) => a.id === aclip.assetId);
      if (!asset) return;
      const inputIdx = audioTrackInputIndices[i];
      filters.push(buildAudioBgFilter(aclip, asset, inputIdx, `abg${i}`));
    });
    const bgRefs = project.audioTrack.map((_, i) => `[abg${i}]`).join("");
    filters.push(
      `[amain]${bgRefs}amix=inputs=${project.audioTrack.length + 1}:duration=longest:normalize=0[afinal]`,
    );
    finalAudioLabel = "afinal";
  }

  // Overlays encima del video — cadena secuencial
  let finalVideoLabel = "vout";
  project.overlayTrack.forEach((ov, i) => {
    const inIdx = overlayInputIndices[i];
    if (inIdx < 0) return; // asset invalido, skip
    const widthPx = overlayWidthPx(ov.size, targetW);
    const alpha = Math.max(0, Math.min(1, ov.opacity)).toFixed(3);
    const pos = overlayPositionExpr(ov.position);
    const start = Math.max(0, ov.startAt).toFixed(3);
    const end = Math.max(ov.startAt + 0.1, ov.endAt).toFixed(3);

    filters.push(
      `[${inIdx}:v]format=yuva420p,colorchannelmixer=aa=${alpha},scale=${widthPx}:-1:force_original_aspect_ratio=decrease[ovl${i}]`,
    );
    const nextLabel = `vmix${i}`;
    filters.push(
      `[${finalVideoLabel}][ovl${i}]overlay=x=${pos.x}:y=${pos.y}:enable='between(t,${start},${end})'[${nextLabel}]`,
    );
    finalVideoLabel = nextLabel;
  });

  // ── Ejecutar ────────────────────────────────────────────────────────────────
  const outputName = "project_output.mp4";
  filesToClean.push(outputName);

  try {
    await ffmpeg.exec([
      ...inputArgs,
      "-filter_complex", filters.join(";"),
      "-map", `[${finalVideoLabel}]`,
      "-map", `[${finalAudioLabel}]`,
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-tune", "fastdecode",
      "-crf", effectiveCrf,
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", isPreview ? "96k" : "128k",
      "-shortest",
      outputName,
    ]);

    const data = await ffmpeg.readFile(outputName);
    const buffer = data instanceof Uint8Array ? data.buffer.slice(0) : data;
    const blob = new Blob([buffer as ArrayBuffer], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);

    // estimar duracion sumando los clips (mas preciso que leer el output)
    const duration = project.videoTrack.reduce((acc, c) => {
      const asset = project.assets.find((a) => a.id === c.assetId);
      if (!asset) return acc;
      return acc + getEffectiveDuration(c, asset);
    }, 0);

    return {
      url,
      size: blob.size,
      duration,
      mimeType: "video/mp4",
      quality: isPreview ? "preview" : "final",
      width: targetW,
      height: targetH,
    };
  } finally {
    for (const f of filesToClean) {
      try { await ffmpeg.deleteFile(f); } catch { /* ignore */ }
    }
  }
}
