"use client";

import type { ToolType } from "@/types/editor";

interface Tool { id: ToolType; label: string; icon: string }

const GROUPS: { label: string; tools: Tool[] }[] = [
  {
    label: "Video",
    tools: [
      { id: "trim",         label: "Cortar",    icon: "✂️" },
      { id: "speed",        label: "Velocidad", icon: "⚡" },
      { id: "rotate",       label: "Rotar",     icon: "🔄" },
      { id: "reverse",      label: "Invertir",  icon: "⏪" },
      { id: "loop",         label: "Loop",      icon: "🔁" },
      { id: "fps",          label: "FPS",       icon: "🎞️" },
    ],
  },
  {
    label: "Audio",
    tools: [
      { id: "audio",        label: "Audio",     icon: "🎵" },
      { id: "volume",       label: "Volumen",   icon: "🔊" },
      { id: "noise",        label: "Ruido",     icon: "🎙️" },
    ],
  },
  {
    label: "Visual",
    tools: [
      { id: "crop",         label: "Recortar",  icon: "⬛" },
      { id: "color",        label: "Color",     icon: "🎨" },
      { id: "fade",         label: "Fade",      icon: "🌅" },
      { id: "text",         label: "Texto",     icon: "T" },
    ],
  },
  {
    label: "Exportar",
    tools: [
      { id: "compress",     label: "Comprimir", icon: "📦" },
      { id: "format",       label: "Formato",   icon: "🔀" },
      { id: "gif",          label: "GIF",       icon: "🖼️" },
      { id: "extract-frame",label: "Captura",   icon: "📷" },
    ],
  },
  {
    label: "Combinar",
    tools: [
      { id: "join",         label: "Unir",      icon: "➕" },
    ],
  },
];

interface ToolbarProps {
  activeTool: ToolType | null;
  onToolSelect: (tool: ToolType) => void;
}

export default function Toolbar({ activeTool, onToolSelect }: ToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1.5 px-0.5">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onToolSelect(tool.id)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${activeTool === tool.id
                    ? "bg-violet-600 text-white shadow-md shadow-violet-900/40"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}
                `}
              >
                <span className="text-sm leading-none">{tool.icon}</span>
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
