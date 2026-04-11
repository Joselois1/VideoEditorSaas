"use client";

import type { ToolType } from "@/types/editor";

interface Tool { id: ToolType; label: string }

const GROUPS: { label: string; tools: Tool[] }[] = [
  {
    label: "Video",
    tools: [
      { id: "trim",          label: "Cortar"    },
      { id: "speed",         label: "Velocidad" },
      { id: "rotate",        label: "Rotar"     },
      { id: "reverse",       label: "Invertir"  },
      { id: "loop",          label: "Loop"      },
      { id: "fps",           label: "FPS"       },
    ],
  },
  {
    label: "Audio",
    tools: [
      { id: "audio",         label: "Audio"    },
      { id: "volume",        label: "Volumen"  },
      { id: "noise",         label: "Ruido"    },
    ],
  },
  {
    label: "Visual",
    tools: [
      { id: "crop",          label: "Recortar" },
      { id: "color",         label: "Color"    },
      { id: "fade",          label: "Fade"     },
      { id: "text",          label: "Texto"    },
    ],
  },
  {
    label: "Exportar",
    tools: [
      { id: "compress",      label: "Comprimir" },
      { id: "format",        label: "Formato"   },
      { id: "gif",           label: "GIF"       },
      { id: "extract-frame", label: "Captura"   },
    ],
  },
  {
    label: "Combinar",
    tools: [
      { id: "join", label: "Unir" },
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
                  px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${activeTool === tool.id
                    ? "bg-violet-600 text-white shadow-md shadow-violet-900/40"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}
                `}
              >
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
