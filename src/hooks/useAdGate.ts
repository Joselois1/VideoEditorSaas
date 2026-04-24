"use client";

import { useCallback, useRef, useState } from "react";

const STORAGE_KEY = "clipcut:lastAdAt";
const COOLDOWN_MS = 60 * 1000; // 60s

function readLastAdAt(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return 0;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

function writeLastAdAt(ts: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, String(ts));
}

/**
 * Gate con cooldown: si pasaron menos de 60s desde el ultimo ad, saltea y
 * ejecuta `after` directo. Si no, muestra el modal y `after` se dispara al
 * completar.
 */
export function useAdGate() {
  const [showAd, setShowAd] = useState(false);
  const afterRef = useRef<(() => void) | null>(null);

  const request = useCallback((after: () => void) => {
    const last = readLastAdAt();
    const now = Date.now();
    if (now - last < COOLDOWN_MS) {
      // cooldown activo — saltamos el ad
      after();
      return;
    }
    afterRef.current = after;
    setShowAd(true);
  }, []);

  const onComplete = useCallback(() => {
    writeLastAdAt(Date.now());
    setShowAd(false);
    const cb = afterRef.current;
    afterRef.current = null;
    cb?.();
  }, []);

  const onClose = useCallback(() => {
    setShowAd(false);
    afterRef.current = null;
  }, []);

  return { showAd, request, onComplete, onClose };
}
