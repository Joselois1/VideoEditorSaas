"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Asset, VideoClip } from "@/types/project";
import { getEffectiveDuration } from "@/types/project";

interface VideoTimelineProps {
  clips: VideoClip[];
  assets: Asset[];
  selectedClipId: string | null;
  totalDuration: number;
  onReorder: (from: number, to: number) => void;
  onSelect: (clipId: string) => void;
  onRemove: (clipId: string) => void;
}

function fmtSecs(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

// ── Clip individual (sortable) ────────────────────────────────────────────────

interface SortableClipProps {
  clip: VideoClip;
  asset: Asset | undefined;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

function SortableClip({ clip, asset, selected, onSelect, onRemove }: SortableClipProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: clip.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  if (!asset) {
    return (
      <div ref={setNodeRef} style={style} className="shrink-0 w-40 h-24 bg-zinc-800 rounded-lg border border-red-500/30" />
    );
  }

  const duration = getEffectiveDuration(clip, asset);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative shrink-0 w-40 h-24 rounded-md overflow-hidden cursor-grab active:cursor-grabbing
        border transition-colors
        ${selected
          ? "border-violet-500"
          : "border-white/10 hover:border-white/20"
        }
        ${isDragging ? "z-50" : ""}
      `}
      {...attributes}
      {...listeners}
    >
      {/* Thumbnail */}
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className="absolute inset-0 w-full h-full bg-zinc-800 text-left"
      >
        {asset.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.thumbnailUrl} alt="" className="w-full h-full object-cover pointer-events-none" draggable={false} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
            </svg>
          </div>
        )}

        {/* Gradiente inferior con info */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1.5">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] text-white/80 truncate font-medium">{asset.name}</span>
            <span className="text-[10px] text-white font-semibold whitespace-nowrap">{fmtSecs(duration)}</span>
          </div>
        </div>

        {/* Badge tipo (superior izquierda) */}
        <span className="absolute top-1 left-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/60 text-zinc-200 backdrop-blur-sm">
          {asset.type === "image" ? "IMG" : "VID"}
        </span>
      </button>

      {/* Eliminar */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        title="Eliminar"
      >
        ×
      </button>
    </div>
  );
}

// ── Track ─────────────────────────────────────────────────────────────────────

export default function VideoTimeline({
  clips, assets, selectedClipId, totalDuration, onReorder, onSelect, onRemove,
}: VideoTimelineProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = clips.findIndex((c) => c.id === active.id);
    const to = clips.findIndex((c) => c.id === over.id);
    if (from !== -1 && to !== -1) onReorder(from, to);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.5-2A1 1 0 0121 9v6a1 1 0 01-1.5.9L15 14M4 7a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
        </svg>
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Video / Fotos</h3>
        <span className="text-xs text-zinc-500">
          {clips.length} {clips.length === 1 ? "clip" : "clips"}
          {totalDuration > 0 && ` • ${fmtSecs(totalDuration)}`}
        </span>
      </div>

      <div className="relative bg-zinc-950/60 border border-white/5 rounded-lg p-3 overflow-x-auto">
        {clips.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-xs text-zinc-500 border border-dashed border-white/10 rounded-md">
            Click en un archivo de la biblioteca para agregarlo aqui
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={clips.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-2 min-h-[6rem]">
                {clips.map((clip) => (
                  <SortableClip
                    key={clip.id}
                    clip={clip}
                    asset={assets.find((a) => a.id === clip.assetId)}
                    selected={selectedClipId === clip.id}
                    onSelect={() => onSelect(clip.id)}
                    onRemove={() => onRemove(clip.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
