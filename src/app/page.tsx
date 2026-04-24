import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M6 2v4M6 10v4m0 4v4M18 2v4m0 4v4m0 4v4M2 6h20M2 18h20" />
      </svg>
    ),
    title: "Cortar videos",
    desc: "Selecciona el inicio y el fin exacto. Sin perdida de calidad.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Cambiar velocidad",
    desc: "Camara lenta o rapida: de 0.25x hasta 2x.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M9 8v8l5 4V4L9 8H5v8h4M17 9a4 4 0 010 6" />
      </svg>
    ),
    title: "Editar audio",
    desc: "Silencia, extrae MP3, ajusta volumen o reduce ruido.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      </svg>
    ),
    title: "Efectos y color",
    desc: "Ajusta brillo, contraste, saturacion y fundidos.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M4 6h16M12 6v14M8 20h8" />
      </svg>
    ),
    title: "Agrega texto",
    desc: "Titulos, subtitulos o marca de agua en cualquier parte.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
      </svg>
    ),
    title: "Exporta listo",
    desc: "Comprime, convierte formato, genera GIFs o captura frames.",
  },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-24 px-4 text-center border-b border-white/5">
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
            <span className="inline-flex items-center gap-2 text-xs text-zinc-400 bg-white/[0.03] border border-white/10 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              Editor gratis &bull; Sin marca de agua &bull; Sin registro
            </span>

            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-[1.05] tracking-tight">
              Edita tus videos<br />
              <span className="text-violet-400">en segundos</span>
            </h1>

            <p className="text-lg text-zinc-400 max-w-xl">
              Sube tu video, elige la herramienta y descarga el resultado. Sin registros, sin marcas de agua, sin limites absurdos.
            </p>

            <Link
              href="/editor"
              className="inline-flex items-center gap-2 text-white font-medium px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors"
            >
              Empezar
              <span>&rarr;</span>
            </Link>

            <p className="text-xs text-zinc-600">
              El video nunca sale de tu navegador &mdash; procesamiento 100% local.
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-4 border-b border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                Todo lo que necesitas
              </h2>
              <p className="text-sm text-zinc-500 mt-1">Un editor completo, sin complicaciones.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-zinc-950 p-6 flex flex-col gap-3 hover:bg-zinc-900/60 transition-colors"
                >
                  <div className="w-9 h-9 rounded-md bg-violet-500/10 text-violet-400 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <h3 className="text-white font-medium">{f.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-5">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">
              Listo para empezar
            </h2>
            <p className="text-sm text-zinc-400">Sin registro. Sin software. Solo sube tu video y edita.</p>
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 text-white font-medium px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors"
            >
              Editar mi video
              <span>&rarr;</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
