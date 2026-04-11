import type {
  TrimSettings, SpeedSettings, CropSettings, AudioSettings,
  CompressSettings, FormatSettings, RotateSettings, ColorSettings,
  ReverseSettings, VolumeSettings, FadeSettings, LoopSettings,
  ExtractFrameSettings, GifSettings, FpsSettings, TextSettings, NoiseSettings,
} from "@/types/editor";

const CRF_MAP = { low: "28", medium: "23", high: "18" } as const;

const TEXT_POSITION: Record<string, { x: string; y: string }> = {
  "top-left":      { x: "10",                y: "10" },
  "top-center":    { x: "(w-text_w)/2",       y: "10" },
  "top-right":     { x: "w-text_w-10",        y: "10" },
  "center":        { x: "(w-text_w)/2",       y: "(h-text_h)/2" },
  "bottom-left":   { x: "10",                y: "h-text_h-10" },
  "bottom-center": { x: "(w-text_w)/2",       y: "h-text_h-10" },
  "bottom-right":  { x: "w-text_w-10",        y: "h-text_h-10" },
};

// ─── Existing tools ───────────────────────────────────────────────────────────

export function buildTrimArgs(i: string, o: string, s: TrimSettings): string[] {
  return [
    "-i", i,
    "-ss", String(s.startTime),
    "-to", String(s.endTime),
    "-c:v", "libx264", "-crf", "18", "-preset", "ultrafast",
    "-c:a", "aac",
    o,
  ];
}

export function buildSpeedArgs(
  i: string, o: string, s: SpeedSettings, hasAudio = true
): string[] {
  const pts = (1 / s.value).toFixed(4);
  const atempo = s.value;
  const audioFilter =
    atempo < 0.5  ? `atempo=0.5,atempo=${(atempo / 0.5).toFixed(4)}` :
    atempo > 2    ? `atempo=2.0,atempo=${(atempo / 2).toFixed(4)}` :
                    `atempo=${atempo}`;

  if (!hasAudio) {
    return ["-i", i, "-vf", `setpts=${pts}*PTS`, "-an", o];
  }
  return [
    "-i", i,
    "-filter_complex", `[0:v]setpts=${pts}*PTS[v];[0:a]${audioFilter}[a]`,
    "-map", "[v]", "-map", "[a]",
    o,
  ];
}

export function buildCropArgs(i: string, o: string, s: CropSettings): string[] {
  return ["-i", i, "-vf", `crop=${s.width}:${s.height}:${s.x}:${s.y}`, "-c:a", "copy", o];
}

export function buildAudioArgs(i: string, o: string, s: AudioSettings): string[] {
  if (s.extractOnly) return ["-i", i, "-vn", "-acodec", "libmp3lame", "-q:a", "2", o];
  if (s.mute)        return ["-i", i, "-an", "-c:v", "copy", o];
  return ["-i", i, "-c", "copy", o];
}

export function buildCompressArgs(i: string, o: string, s: CompressSettings): string[] {
  return ["-i", i, "-vcodec", "libx264", "-crf", CRF_MAP[s.quality], "-preset", "fast", "-acodec", "aac", o];
}

export function buildFormatArgs(i: string, o: string): string[] {
  return ["-i", i, o];
}

// ─── New tools ────────────────────────────────────────────────────────────────

export function buildRotateArgs(i: string, o: string, s: RotateSettings): string[] {
  const filters: string[] = [];
  if (s.angle === 90)  filters.push("transpose=1");
  if (s.angle === 180) filters.push("transpose=2,transpose=2");
  if (s.angle === 270) filters.push("transpose=2");
  if (s.flipH) filters.push("hflip");
  if (s.flipV) filters.push("vflip");

  if (filters.length === 0) return ["-i", i, "-c", "copy", o];
  return ["-i", i, "-vf", filters.join(","), "-c:a", "copy", o];
}

export function buildColorArgs(i: string, o: string, s: ColorSettings): string[] {
  const eq = `eq=brightness=${s.brightness}:contrast=${s.contrast}:saturation=${s.saturation}`;
  return ["-i", i, "-vf", eq, "-c:a", "copy", o];
}

export function buildReverseArgs(i: string, o: string, s: ReverseSettings): string[] {
  if (s.audio) return ["-i", i, "-vf", "reverse", "-af", "areverse", o];
  return ["-i", i, "-vf", "reverse", "-an", o];
}

export function buildVolumeArgs(i: string, o: string, s: VolumeSettings): string[] {
  return ["-i", i, "-af", `volume=${s.level}`, "-c:v", "copy", o];
}

export function buildFadeArgs(
  i: string, o: string, s: FadeSettings, duration: number
): string[] {
  const vFilters: string[] = [];
  const aFilters: string[] = [];

  if (s.fadeIn > 0) {
    vFilters.push(`fade=in:st=0:d=${s.fadeIn}`);
    aFilters.push(`afade=in:st=0:d=${s.fadeIn}`);
  }
  if (s.fadeOut > 0) {
    const st = Math.max(0, duration - s.fadeOut);
    vFilters.push(`fade=out:st=${st}:d=${s.fadeOut}`);
    aFilters.push(`afade=out:st=${st}:d=${s.fadeOut}`);
  }

  const args = ["-i", i];
  if (vFilters.length) args.push("-vf", vFilters.join(","));
  if (aFilters.length) args.push("-af", aFilters.join(","));
  args.push("-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac", o);
  return args;
}

export function buildLoopArgs(i: string, o: string, s: LoopSettings): string[] {
  // -stream_loop N repeats N extra times (total = N+1 plays)
  return ["-stream_loop", String(s.count - 1), "-i", i, "-c", "copy", o];
}

export function buildExtractFrameArgs(i: string, o: string, s: ExtractFrameSettings): string[] {
  return ["-i", i, "-ss", String(s.time), "-vframes", "1", o];
}

// GIF uses a two-pass approach for better color quality.
// Pass 1 generates a palette; pass 2 uses it to encode the GIF.
export function buildGifPass1Args(i: string, s: GifSettings): string[] {
  return [
    "-ss", String(s.startTime), "-to", String(s.endTime), "-i", i,
    "-vf", `fps=${s.fps},scale=${s.width}:-1:flags=lanczos,palettegen`,
    "palette.png",
  ];
}

export function buildGifPass2Args(i: string, s: GifSettings): string[] {
  return [
    "-ss", String(s.startTime), "-to", String(s.endTime), "-i", i,
    "-i", "palette.png",
    "-filter_complex", `fps=${s.fps},scale=${s.width}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
    "output.gif",
  ];
}

export function buildFpsArgs(i: string, o: string, s: FpsSettings): string[] {
  return ["-i", i, "-vf", `fps=${s.fps}`, "-c:a", "copy", o];
}

export function buildTextArgs(
  i: string, o: string, s: TextSettings, fontPath: string
): string[] {
  const { x, y } = TEXT_POSITION[s.position] ?? TEXT_POSITION["bottom-center"];
  // Escape single quotes in text
  const safeText = s.text.replace(/'/g, "\u2019");
  const enableClause =
    s.endTime > s.startTime
      ? `:enable='between(t,${s.startTime},${s.endTime})'`
      : "";
  const drawtext = `drawtext=fontfile=${fontPath}:text='${safeText}':fontsize=${s.fontSize}:fontcolor=${s.color}:x=${x}:y=${y}${enableClause}`;
  return ["-i", i, "-vf", drawtext, "-c:a", "copy", o];
}

export function buildNoiseArgs(i: string, o: string, s: NoiseSettings): string[] {
  return ["-i", i, "-af", `afftdn=nf=-${s.strength}`, "-c:v", "copy", o];
}

// Join: filenames and concat list are written to FS by the processor
export function buildJoinArgs(concatFile: string, o: string): string[] {
  return ["-f", "concat", "-safe", "0", "-i", concatFile, "-c", "copy", o];
}
