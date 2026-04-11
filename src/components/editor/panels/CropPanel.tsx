"use client";

import { useState } from "react";
import type { CropSettings } from "@/types/editor";

const PRESETS = [
  { label: "16:9", w: 1920, h: 1080 },
  { label: "9:16", w: 1080, h: 1920 },
  { label: "1:1", w: 1080, h: 1080 },
  { label: "4:3", w: 1440, h: 1080 },
];

interface CropPanelProps {
  videoWidth: number;
  videoHeight: number;
  settings: CropSettings | null;
  onChange: (crop: CropSettings) => void;
}

export default function CropPanel({ videoWidth, videoHeight, settings, onChange }: CropPanelProps) {
  const [crop, setCrop] = useState<CropSettings>(
    settings ?? { x: 0, y: 0, width: videoWidth, height: videoHeight }
  );

  const update = (patch: Partial<CropSettings>) => {
    const next = { ...crop, ...patch };
    setCrop(next);
    onChange(next);
  };

  const applyPreset = (w: number, h: number) => {
    const ratio = w / h;
    let nw = videoWidth;
    let nh = Math.round(nw / ratio);
    if (nh > videoHeight) { nh = videoHeight; nw = Math.round(nh * ratio); }
    const x = Math.floor((videoWidth - nw) / 2);
    const y = Math.floor((videoHeight - nh) / 2);
    update({ x, y, width: nw, height: nh });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs text-zinc-500 mb-2">Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.w, p.h)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {(["x", "y", "width", "height"] as const).map((field) => (
          <div key={field} className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500 capitalize">{field}</label>
            <input
              type="number"
              value={crop[field]}
              onChange={(e) => update({ [field]: parseInt(e.target.value) || 0 })}
              className="bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-500">
        Video original: {videoWidth}&times;{videoHeight} &mdash; Recorte: {crop.width}&times;{crop.height}
      </p>
    </div>
  );
}
