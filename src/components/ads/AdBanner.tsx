"use client";

import { useEffect, useRef } from "react";

const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT;
const IS_CONFIGURED = Boolean(PUBLISHER_ID && AD_SLOT);

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  className?: string;
}

export default function AdBanner({ className }: AdBannerProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!IS_CONFIGURED || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense no disponible (bloqueador, desarrollo local, etc.)
    }
  }, []);

  if (!IS_CONFIGURED) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 text-center px-6 py-10 bg-zinc-900/50 border border-dashed border-white/10 rounded-xl${className ? ` ${className}` : ""}`}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Espacio publicitario
        </span>
        <p className="text-sm text-zinc-400 max-w-xs">
          Gracias por apoyar clipcut &mdash; aqui apareceran anuncios cuando el sitio este aprobado.
        </p>
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={{ display: "block" }}
      data-ad-client={PUBLISHER_ID}
      data-ad-slot={AD_SLOT}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
