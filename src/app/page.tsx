import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const features = [
  {
    gradient: "from-violet-500 to-fuchsia-500",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M6 2v4M6 10v4m0 4v4M18 2v4m0 4v4m0 4v4M2 6h20M2 18h20" />
      </svg>
    ),
    title: "Cortar videos",
    desc: "Selecciona el inicio y el fin exacto. Sin perdida de calidad.",
  },
  {
    gradient: "from-orange-400 to-pink-500",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Cambiar velocidad",
    desc: "Camara lenta o rapida: de 0.25x hasta 2x.",
  },
  {
    gradient: "from-cyan-400 to-violet-500",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 8v8l5 4V4L9 8H5v8h4M17 9a4 4 0 010 6" />
      </svg>
    ),
    title: "Editar audio",
    desc: "Silencia, extrae MP3, ajusta volumen o reduce ruido.",
  },
  {
    gradient: "from-fuchsia-500 to-rose-500",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      </svg>
    ),
    title: "Efectos y color",
    desc: "Ajusta brillo, contraste, saturacion y fundidos.",
  },
  {
    gradient: "from-emerald-400 to-cyan-500",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4 6h16M12 6v14M8 20h8" />
      </svg>
    ),
    title: "Agrega texto",
    desc: "Titulos, subtitulos o watermarks en cualquier parte.",
  },
  {
    gradient: "from-amber-400 to-orange-500",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
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
        <section className="relative overflow-hidden py-28 px-4 text-center">
          {/* Fondo con gradientes colorados */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-violet-600/30 via-fuchsia-500/20 to-orange-500/20 blur-3xl rounded-full" />
            <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-cyan-500/10 blur-3xl rounded-full" />
            <div className="absolute top-20 -right-20 w-[400px] h-[400px] bg-rose-500/10 blur-3xl rounded-full" />
          </div>

          <div className="relative max-w-3xl mx-auto flex flex-col items-center gap-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-white bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-orange-500/20 border border-white/10 px-4 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-orange-400 animate-pulse" />
              Editor gratis &bull; Sin marca de agua &bull; Sin registro
            </span>

            <h1 className="text-5xl sm:text-7xl font-extrabold leading-[1.05] tracking-tight">
              <span className="text-white">Edita tus videos</span><br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">
                en segundos
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 max-w-xl">
              Sube tu video, elige la herramienta y descarga el resultado. Sin registros, sin marcas de agua, sin limites absurdos.
            </p>

            <Link
              href="/editor"
              className="group relative inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl text-lg
                         bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500
                         bg-[length:200%_100%] bg-left hover:bg-right
                         shadow-xl shadow-fuchsia-900/40 hover:shadow-2xl hover:shadow-fuchsia-700/50
                         transition-all duration-500 hover:scale-105"
            >
              Empezar ahora
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>

            <p className="text-xs text-zinc-500">
              El video nunca sale de tu navegador &mdash; procesamiento 100% local.
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-semibold uppercase tracking-widest text-fuchsia-400">
                Todo lo que necesitas
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
                Un editor completo, sin complicaciones
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group relative bg-zinc-900/60 border border-white/5 rounded-2xl p-6 flex flex-col gap-3
                             hover:border-white/20 transition-all hover:-translate-y-1"
                >
                  {/* glow de fondo en hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity pointer-events-none`} />

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} text-white flex items-center justify-center shadow-lg`}>
                    {f.icon}
                  </div>
                  <h3 className="text-white font-semibold text-lg">{f.title}</h3>
                  <p className="text-zinc-400 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-violet-600/20 via-fuchsia-500/20 to-orange-500/20 blur-3xl rounded-full" />
          </div>
          <div className="relative max-w-2xl mx-auto flex flex-col items-center gap-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Listo para <span className="bg-gradient-to-r from-fuchsia-400 to-orange-400 bg-clip-text text-transparent">empezar?</span>
            </h2>
            <p className="text-zinc-400">Sin registro. Sin software. Solo sube tu video y edita.</p>
            <Link
              href="/editor"
              className="group inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl text-lg
                         bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500
                         bg-[length:200%_100%] bg-left hover:bg-right
                         shadow-xl shadow-fuchsia-900/40 transition-all duration-500 hover:scale-105"
            >
              Editar mi video
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
