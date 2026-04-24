"use client";

import { useState, useCallback } from "react";
import type {
  Project,
  Asset,
  VideoClip,
  AudioClip,
  ClipEffects,
  AspectPreset,
} from "@/types/project";
import { makeClipId } from "@/types/project";
import { buildAsset } from "@/lib/project/assets";

const initialProject: Project = {
  assets: [],
  videoTrack: [],
  audioTrack: [],
  output: { aspect: "original", maxHeight: 1080 },
  selectedClipId: null,
};

export function useProject() {
  const [project, setProject] = useState<Project>(initialProject);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Assets ────────────────────────────────────────────────────────────────
  const addAssets = useCallback(async (files: File[]) => {
    setLoadingAssets(true);
    setError(null);
    const built: Asset[] = [];
    const errors: string[] = [];
    for (const f of files) {
      try {
        built.push(await buildAsset(f));
      } catch (e) {
        errors.push(e instanceof Error ? e.message : `Error con ${f.name}`);
      }
    }
    setProject((p) => ({ ...p, assets: [...p.assets, ...built] }));
    setLoadingAssets(false);
    if (errors.length) setError(errors.join(" • "));
  }, []);

  const removeAsset = useCallback((assetId: string) => {
    setProject((p) => {
      const asset = p.assets.find((a) => a.id === assetId);
      if (asset) URL.revokeObjectURL(asset.url);
      return {
        ...p,
        assets: p.assets.filter((a) => a.id !== assetId),
        videoTrack: p.videoTrack.filter((c) => c.assetId !== assetId),
        audioTrack: p.audioTrack.filter((c) => c.assetId !== assetId),
      };
    });
  }, []);

  // ── Video track ───────────────────────────────────────────────────────────
  const addVideoClip = useCallback((assetId: string) => {
    setProject((p) => {
      const asset = p.assets.find((a) => a.id === assetId);
      if (!asset || (asset.type !== "video" && asset.type !== "image")) return p;
      const clip: VideoClip = { id: makeClipId(), assetId, effects: {} };
      return { ...p, videoTrack: [...p.videoTrack, clip] };
    });
  }, []);

  const removeVideoClip = useCallback((clipId: string) => {
    setProject((p) => ({
      ...p,
      videoTrack: p.videoTrack.filter((c) => c.id !== clipId),
      selectedClipId: p.selectedClipId === clipId ? null : p.selectedClipId,
    }));
  }, []);

  const reorderVideoTrack = useCallback((fromIndex: number, toIndex: number) => {
    setProject((p) => {
      if (fromIndex === toIndex) return p;
      const next = [...p.videoTrack];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { ...p, videoTrack: next };
    });
  }, []);

  const updateClipEffects = useCallback((clipId: string, patch: Partial<ClipEffects>) => {
    setProject((p) => ({
      ...p,
      videoTrack: p.videoTrack.map((c) =>
        c.id === clipId ? { ...c, effects: { ...c.effects, ...patch } } : c,
      ),
    }));
  }, []);

  // ── Audio track ───────────────────────────────────────────────────────────
  const addAudioClip = useCallback((assetId: string) => {
    setProject((p) => {
      const asset = p.assets.find((a) => a.id === assetId);
      if (!asset || asset.type !== "audio") return p;
      const clip: AudioClip = {
        id: makeClipId(),
        assetId,
        startAt: 0,
        volume: 1,
      };
      return { ...p, audioTrack: [...p.audioTrack, clip] };
    });
  }, []);

  const removeAudioClip = useCallback((clipId: string) => {
    setProject((p) => ({
      ...p,
      audioTrack: p.audioTrack.filter((c) => c.id !== clipId),
    }));
  }, []);

  const updateAudioClip = useCallback((clipId: string, patch: Partial<AudioClip>) => {
    setProject((p) => ({
      ...p,
      audioTrack: p.audioTrack.map((c) => (c.id === clipId ? { ...c, ...patch } : c)),
    }));
  }, []);

  // ── Selection ─────────────────────────────────────────────────────────────
  const selectClip = useCallback((clipId: string | null) => {
    setProject((p) => ({ ...p, selectedClipId: clipId }));
  }, []);

  // ── Output settings ───────────────────────────────────────────────────────
  const setAspect = useCallback((aspect: AspectPreset) => {
    setProject((p) => ({ ...p, output: { ...p.output, aspect } }));
  }, []);

  const setMaxHeight = useCallback((maxHeight: number) => {
    setProject((p) => ({ ...p, output: { ...p.output, maxHeight } }));
  }, []);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    project.assets.forEach((a) => URL.revokeObjectURL(a.url));
    setProject(initialProject);
    setError(null);
  }, [project.assets]);

  return {
    project,
    loadingAssets,
    error,
    setError,
    addAssets,
    removeAsset,
    addVideoClip,
    removeVideoClip,
    reorderVideoTrack,
    updateClipEffects,
    addAudioClip,
    removeAudioClip,
    updateAudioClip,
    selectClip,
    setAspect,
    setMaxHeight,
    reset,
  };
}
