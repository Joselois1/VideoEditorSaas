import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <span className="relative inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-500 shadow-lg shadow-fuchsia-500/30">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.5-2A1 1 0 0121 9v6a1 1 0 01-1.5.9L15 14M4 7a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-white">clip</span>
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">
              cut
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/#features" className="hover:text-white transition-colors">
            Funciones
          </Link>
          <Link
            href="/editor"
            className="text-white font-medium px-4 py-1.5 rounded-full
                       bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500
                       bg-[length:200%_100%] bg-left hover:bg-right
                       shadow-md shadow-fuchsia-900/30 transition-all duration-500"
          >
            Editar video
          </Link>
        </nav>
      </div>
    </header>
  );
}
