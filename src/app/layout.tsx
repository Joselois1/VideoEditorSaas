import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Reemplaza con tu Publisher ID de Google AdSense
const PUBLISHER_ID = "ca-pub-XXXXXXXXXXXXXXXX";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "clipcut — Editor de video online gratis",
  description:
    "Corta, recorta, comprime y convierte tus videos directamente en el navegador. Sin registro, sin marcas de agua, 100% gratis.",
  keywords: ["editor de video", "cortar video online", "sin marca de agua", "comprimir video"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        {children}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
