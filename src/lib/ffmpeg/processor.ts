import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { EditorState } from "@/types/editor";
import {
  buildTrimArgs, buildSpeedArgs, buildCropArgs, buildAudioArgs,
  buildCompressArgs, buildFormatArgs, buildRotateArgs, buildColorArgs,
  buildReverseArgs, buildVolumeArgs, buildFadeArgs, buildLoopArgs,
  buildExtractFrameArgs, buildGifPass1Args, buildGifPass2Args, buildFpsArgs,
  buildTextArgs, buildNoiseArgs, buildJoinArgs,
} from "./commands";

// Multi-thread core: aprovecha varios cores del CPU via SharedArrayBuffer.
// Requiere los headers COOP/COEP configurados en next.config.ts.
const FFMPEG_BASE_URL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd";
const FONT_URL = "https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Regular.ttf";
const FONT_PATH = "/tmp/font.ttf";

export async function loadFFmpeg(
  ffmpeg: FFmpeg,
  onProgress?: (p: number) => void
): Promise<void> {
  ffmpeg.on("progress", ({ progress }) => {
    onProgress?.(Math.round(progress * 100));
  });
  await ffmpeg.load({
    coreURL: await toBlobURL(`${FFMPEG_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${FFMPEG_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(`${FFMPEG_BASE_URL}/ffmpeg-core.worker.js`, "text/javascript"),
  });
}

async function probeHasAudio(ffmpeg: FFmpeg, inputName: string): Promise<boolean> {
  let output = "";
  const onLog = ({ message }: { message: string }) => { output += message + "\n"; };
  ffmpeg.on("log", onLog);
  try {
    await ffmpeg.exec(["-i", inputName]).catch(() => {});
  } finally {
    ffmpeg.off("log", onLog);
  }
  return output.includes("Audio:");
}

async function ensureFont(ffmpeg: FFmpeg): Promise<void> {
  try {
    await ffmpeg.readFile(FONT_PATH);
  } catch {
    const fontData = await fetchFile(FONT_URL);
    await ffmpeg.writeFile(FONT_PATH, fontData);
  }
}

function getMimeType(ext: string): string {
  if (ext === "mp3")  return "audio/mpeg";
  if (ext === "gif")  return "image/gif";
  if (ext === "png")  return "image/png";
  if (ext === "webm") return "video/webm";
  if (ext === "mov")  return "video/quicktime";
  return "video/mp4";
}

export async function processVideo(
  ffmpeg: FFmpeg,
  state: EditorState
): Promise<{ url: string; isImage: boolean }> {
  if (!state.video) throw new Error("No video loaded");

  const ext = state.video.name.split(".").pop() ?? "mp4";
  const inputName = `input.${ext}`;
  await ffmpeg.writeFile(inputName, await fetchFile(state.video.file));

  const {
    activeTool, trim, speed, crop, audio, compress, format,
    rotate, color, reverse, volume, fade, loop,
    extractFrame, gif, fps, join, text, noise,
  } = state;

  let outputExt = ext;
  let isImage = false;
  const filesToClean = [inputName];

  try {
    switch (activeTool) {
      // ── Existing ──────────────────────────────────────────────────────────
      case "trim":
        await ffmpeg.exec(buildTrimArgs(inputName, `output.${outputExt}`, trim));
        break;

      case "speed": {
        const hasAudio = await probeHasAudio(ffmpeg, inputName);
        await ffmpeg.exec(buildSpeedArgs(inputName, `output.${outputExt}`, speed, hasAudio));
        break;
      }

      case "crop": {
        const cropSettings = crop ?? { x: 0, y: 0, width: state.video.width, height: state.video.height };
        await ffmpeg.exec(buildCropArgs(inputName, `output.${outputExt}`, cropSettings));
        break;
      }

      case "audio":
        outputExt = audio.extractOnly ? "mp3" : ext;
        await ffmpeg.exec(buildAudioArgs(inputName, `output.${outputExt}`, audio));
        break;

      case "compress":
        outputExt = "mp4";
        await ffmpeg.exec(buildCompressArgs(inputName, `output.${outputExt}`, compress));
        break;

      case "format":
        outputExt = format.target;
        await ffmpeg.exec(buildFormatArgs(inputName, `output.${outputExt}`));
        break;

      // ── New tools ─────────────────────────────────────────────────────────
      case "rotate":
        await ffmpeg.exec(buildRotateArgs(inputName, `output.${outputExt}`, rotate));
        break;

      case "color":
        await ffmpeg.exec(buildColorArgs(inputName, `output.${outputExt}`, color));
        break;

      case "reverse":
        await ffmpeg.exec(buildReverseArgs(inputName, `output.${outputExt}`, reverse));
        break;

      case "volume":
        await ffmpeg.exec(buildVolumeArgs(inputName, `output.${outputExt}`, volume));
        break;

      case "fade":
        await ffmpeg.exec(buildFadeArgs(inputName, `output.${outputExt}`, fade, state.video.duration));
        break;

      case "loop":
        await ffmpeg.exec(buildLoopArgs(inputName, `output.${outputExt}`, loop));
        break;

      case "extract-frame":
        outputExt = "png";
        isImage = true;
        await ffmpeg.exec(buildExtractFrameArgs(inputName, `output.${outputExt}`, extractFrame));
        break;

      case "gif": {
        outputExt = "gif";
        // Two-pass GIF: generate palette then encode
        await ffmpeg.exec(buildGifPass1Args(inputName, gif));
        filesToClean.push("palette.png");
        await ffmpeg.exec(buildGifPass2Args(inputName, gif));
        break;
      }

      case "fps":
        await ffmpeg.exec(buildFpsArgs(inputName, `output.${outputExt}`, fps));
        break;

      case "join": {
        outputExt = "mp4";
        const targetW = state.video.width;
        const targetH = state.video.height;

        // Build the full list: original video first, then additional clips
        const allClips = [
          { file: state.video.file, isImage: false, duration: 0 },
          ...join.clips,
        ];

        // Build input args: images need -loop 1 -t <duration> before -i
        const inputArgs: string[] = [];
        for (const clip of allClips) {
          const clipExt = clip.file.name.split(".").pop() ?? "mp4";
          const name = `join_${inputArgs.length / (clip.isImage ? 4 : 2)}.${clipExt}`;
          await ffmpeg.writeFile(name, await fetchFile(clip.file));
          filesToClean.push(name);
          if (clip.isImage) {
            inputArgs.push("-loop", "1", "-t", String(clip.duration), "-i", name);
          } else {
            inputArgs.push("-i", name);
          }
        }

        // Normalize every stream to same resolution + fps, then concat
        const scaleFilter = `scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease,pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2,fps=30,setsar=1`;
        const filterParts = allClips.map((_, i) => `[${i}:v]${scaleFilter}[v${i}]`);
        const concatSrc = allClips.map((_, i) => `[v${i}]`).join("");
        filterParts.push(`${concatSrc}concat=n=${allClips.length}:v=1:a=0[v]`);

        await ffmpeg.exec([
          ...inputArgs,
          "-filter_complex", filterParts.join(";"),
          "-map", "[v]",
          "-c:v", "libx264",
          "-preset", "ultrafast",
          "-an",
          `output.${outputExt}`,
        ]);
        break;
      }

      case "text": {
        await ensureFont(ffmpeg);
        await ffmpeg.exec(buildTextArgs(inputName, `output.${outputExt}`, text, FONT_PATH));
        break;
      }

      case "noise":
        await ffmpeg.exec(buildNoiseArgs(inputName, `output.${outputExt}`, noise));
        break;

      default:
        throw new Error("No tool selected");
    }

    const outputName = `output.${outputExt}`;
    filesToClean.push(outputName);

    const data = await ffmpeg.readFile(outputName);
    const buffer = data instanceof Uint8Array ? data.buffer.slice(0) : data;
    const blob = new Blob([buffer as ArrayBuffer], { type: getMimeType(outputExt) });
    return { url: URL.createObjectURL(blob), isImage };

  } finally {
    for (const f of filesToClean) {
      try { await ffmpeg.deleteFile(f); } catch { /* ignore */ }
    }
  }
}
