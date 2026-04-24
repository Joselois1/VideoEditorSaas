"use client";

import { useState, useEffect } from "react";
import type { ToolType } from "@/types/editor";

type CategoryId = "basic" | "speed" | "audio" | "effects" | "elements" | "export";

interface Tool {
  id: ToolType;
  label: string;
  icon: React.ReactNode;
}

interface Category {
  id: CategoryId;
  label: string;
  icon: React.ReactNode;
  tools: Tool[];
}

// ── Icons (inline, consistent weight) ─────────────────────────────────────────
const I = {
  scissors: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
      <path strokeLinecap="round" d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
    </svg>
  ),
  bolt: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  wave: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M4 12h2M8 8v8M12 4v16M16 8v8M20 12h-2" />
    </svg>
  ),
  sparkles: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14zM6 14l.8 2.2L9 17l-2.2.8L6 20l-.8-2.2L3 17l2.2-.8L6 14z" />
    </svg>
  ),
  text: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M12 6v14M8 20h8" />
    </svg>
  ),
  download: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
    </svg>
  ),
  // tool icons (small, stylized)
  cut:      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" d="M6 4v16M18 4v16M6 8h12M6 16h12" /></svg>,
  crop:     <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6 2v14a2 2 0 002 2h14M18 22V8a2 2 0 00-2-2H2" /></svg>,
  rotate:   <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M20 9A8 8 0 006.5 5.5M4 15a8 8 0 0013.5 3.5" /></svg>,
  join:     <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h6v12H3zM15 6h6v12h-6zM9 12h6" /></svg>,
  speed:    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  reverse:  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5 5-5M18 17l-5-5 5-5" /></svg>,
  loop:     <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8 8 8 0 016 2.7M20 12a8 8 0 01-8 8 8 8 0 01-6-2.7M16 4h4v4M8 20H4v-4" /></svg>,
  fps:      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" /></svg>,
  mute:     <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 8v8l5 4V4L9 8H5v8h4M17 9l4 6M21 9l-4 6" /></svg>,
  volume:   <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 8v8l5 4V4L9 8H5v8h4M17 9a4 4 0 010 6" /></svg>,
  noise:    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M3 12h2M7 9v6M11 6v12M15 9v6M19 12h2" /></svg>,
  color:    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 100 18 3 3 0 003-3 2 2 0 012-2h1a3 3 0 003-3 9 9 0 00-9-10z" /></svg>,
  fade:     <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" opacity=".3" /><path strokeLinecap="round" d="M4 4l16 16" /></svg>,
  textTool: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M12 6v14M8 20h8" /></svg>,
  compress: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>,
  format:   <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10l4 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2zM14 4v6h6" /></svg>,
  gif:      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM8 10v4M16 10v4M12 10v4M13 12h3" /></svg>,
  frame:    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM8 15l3-3 2 2 3-4 3 5" /></svg>,
};

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  {
    id: "basic", label: "Básico", icon: I.scissors,
    tools: [
      { id: "trim",   label: "Cortar",   icon: I.cut },
      { id: "crop",   label: "Recortar", icon: I.crop },
      { id: "rotate", label: "Rotar",    icon: I.rotate },
      { id: "join",   label: "Unir",     icon: I.join },
    ],
  },
  {
    id: "speed", label: "Velocidad", icon: I.bolt,
    tools: [
      { id: "speed",   label: "Velocidad", icon: I.speed },
      { id: "reverse", label: "Invertir",  icon: I.reverse },
      { id: "loop",    label: "Loop",      icon: I.loop },
      { id: "fps",     label: "FPS",       icon: I.fps },
    ],
  },
  {
    id: "audio", label: "Audio", icon: I.wave,
    tools: [
      { id: "audio",  label: "Silenciar / Extraer", icon: I.mute },
      { id: "volume", label: "Volumen",             icon: I.volume },
      { id: "noise",  label: "Reducir ruido",       icon: I.noise },
    ],
  },
  {
    id: "effects", label: "Efectos", icon: I.sparkles,
    tools: [
      { id: "color", label: "Color",       icon: I.color },
      { id: "fade",  label: "Fade in/out", icon: I.fade },
    ],
  },
  {
    id: "elements", label: "Elementos", icon: I.text,
    tools: [
      { id: "text", label: "Texto", icon: I.textTool },
    ],
  },
  {
    id: "export", label: "Exportar", icon: I.download,
    tools: [
      { id: "compress",      label: "Comprimir", icon: I.compress },
      { id: "format",        label: "Formato",   icon: I.format },
      { id: "gif",           label: "GIF",       icon: I.gif },
      { id: "extract-frame", label: "Captura",   icon: I.frame },
    ],
  },
];

// Fast lookup: tool -> category (to auto-open the right tab if activeTool changes externally)
const TOOL_TO_CATEGORY: Record<string, CategoryId> = CATEGORIES.reduce((acc, cat) => {
  cat.tools.forEach((t) => (acc[t.id] = cat.id));
  return acc;
}, {} as Record<string, CategoryId>);

interface ToolbarProps {
  activeTool: ToolType | null;
  onToolSelect: (tool: ToolType) => void;
}

export default function Toolbar({ activeTool, onToolSelect }: ToolbarProps) {
  const [openCategory, setOpenCategory] = useState<CategoryId>("basic");

  // Si la tool activa cambia desde afuera (ej: auto-seleccion de "join" al subir multiples),
  // abrimos automaticamente su categoria.
  useEffect(() => {
    if (activeTool && TOOL_TO_CATEGORY[activeTool]) {
      setOpenCategory(TOOL_TO_CATEGORY[activeTool]);
    }
  }, [activeTool]);

  const current = CATEGORIES.find((c) => c.id === openCategory)!;

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs de categorias */}
      <div className="grid grid-cols-3 gap-1">
        {CATEGORIES.map((cat) => {
          const isOpen = cat.id === openCategory;
          return (
            <button
              key={cat.id}
              onClick={() => setOpenCategory(cat.id)}
              className={`
                flex flex-col items-center gap-1 px-2 py-2 rounded-md
                text-[11px] font-medium transition-colors
                ${isOpen
                  ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                  : "bg-transparent text-zinc-500 border border-transparent hover:bg-white/[0.04] hover:text-zinc-300"
                }
              `}
            >
              <span className="w-4 h-4">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Herramientas de la categoria activa */}
      <div className="flex flex-col gap-1">
        {current.tools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                ${isActive
                  ? "bg-violet-500/15 text-white border border-violet-500/30"
                  : "bg-transparent text-zinc-400 border border-transparent hover:bg-white/[0.04] hover:text-white"
                }
              `}
            >
              <span className={`
                w-6 h-6 shrink-0 flex items-center justify-center
                ${isActive ? "text-violet-300" : "text-zinc-500"}
              `}>
                <span className="w-4 h-4">{tool.icon}</span>
              </span>
              <span className="flex-1 text-left">{tool.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-violet-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
