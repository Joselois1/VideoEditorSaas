import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M6 2v4M6 10v4m0 4v4M18 2v4m0 4v4m0 4v4M2 6h20M2 18h20" />
      </svg>
    ),
    title: "Cortar videos",
    desc: "Selecciona el inicio y el fin exacto. Sin perdida de calidad.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Cambiar velocidad",
    desc: "Camara lenta o rapida: de 0.25x hasta 2x.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M6 2v14a2 2 0 002 2h14M18 22V8a2 2 0 00-2-2H2" />
      </svg>
    ),
    title: "Recortar area",
    desc: "Cambia la proporcion o recorta la zona que te interesa.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
      </svg>
    ),
    title: "Editar audio",
    desc: "Silencia el video o extrae el audio en MP3.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 9l-7 7-7-7" />
      </svg>
    ),
    title: "Comprimir",
    desc: "Reduce el peso del archivo sin sacrificar demasiada calidad.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
    title: "Convertir formato",
    desc: "De MP4 a WebM, MOV, AVI y viceversa.",
  },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-24 px-4 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/30 via-zinc-950 to-zinc-950 pointer-events-none" />
          <div className="relative max-w-3xl mx-auto flex flex-col items-center gap-6">
            <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full">
              Editor de video online &bull; Gratis &bull; Sin marcas de agua
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight">
              Edita tus videos<br />
              <span className="text-violet-400">en segundos</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl">
              Sube tu video, elige la herramienta y descarga el resultado. Sin registros, sin marcas de agua, sin limites absurdos.
            </p>
            <Link
              href="/editor"
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all hover:scale-105 shadow-lg shadow-violet-900/40"
            >
              Empezar ahora &rarr;
            </Link>
            <p className="text-xs text-zinc-600">
              El video nunca sale de tu navegador &mdash; procesamiento 100% local.
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Todo lo que necesitas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col gap-3 hover:border-violet-500/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <h3 className="text-white font-semibold">{f.title}</h3>
                  <p className="text-zinc-400 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
            <h2 className="text-3xl font-bold text-white">Listo para empezar?</h2>
            <p className="text-zinc-400">Sin registro. Sin software. Solo sube tu video y edita.</p>
            <Link
              href="/editor"
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all hover:scale-105"
            >
              Editar mi video
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
