"use client";

import { useEffect, useState } from "react";
import AdBanner from "./AdBanner";

interface AdModalProps {
  onComplete: () => void;
  onClose: () => void;
}

const AD_DURATION = 10;

export default function AdModal({ onComplete, onClose }: AdModalProps) {
  const [remaining, setRemaining] = useState(AD_DURATION);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= AD_DURATION - 5) setCanSkip(true);
        return next;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [remaining, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl">
        <div className="px-5 py-3 bg-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>Anuncio &mdash; gracias por apoyar clipcut</span>
          <span className="text-white font-medium">
            {remaining > 0 ? `${remaining}s` : "Completado"}
          </span>
        </div>

        {/* Anuncio Google AdSense */}
        <div className="min-h-64 bg-zinc-950 flex items-center justify-center">
          <AdBanner className="w-full" />
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-zinc-400">
            {remaining > 0
              ? `Tu descarga estara lista en ${remaining} segundos...`
              : "Listo! Descargando tu video."}
          </p>

          {canSkip ? (
            <button
              onClick={onComplete}
              className="shrink-0 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Saltar
            </button>
          ) : (
            <button
              onClick={onClose}
              className="shrink-0 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>

        <div className="h-1 bg-zinc-800">
          <div
            className="h-full bg-violet-500 transition-all duration-1000"
            style={{ width: `${((AD_DURATION - remaining) / AD_DURATION) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
