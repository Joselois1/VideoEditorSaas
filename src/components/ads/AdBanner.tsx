"use client";

import { useEffect, useRef } from "react";

// Reemplaza estos valores con los de tu cuenta Google AdSense
const PUBLISHER_ID = "ca-pub-XXXXXXXXXXXXXXXX";
const AD_SLOT      = "XXXXXXXXXX";

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
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense no disponible (bloqueador, desarrollo local, etc.)
    }
  }, []);

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
