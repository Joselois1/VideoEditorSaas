import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-violet-600">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.5-2A1 1 0 0121 9v6a1 1 0 01-1.5.9L15 14M4 7a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-white">clip</span>
            <span className="text-violet-400">cut</span>
          </span>
        </Link>

        <nav className="flex items-center gap-5 text-sm text-zinc-400">
          <Link href="/#features" className="hover:text-white transition-colors">
            Funciones
          </Link>
          <Link
            href="/editor"
            className="text-white font-medium px-3.5 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 transition-colors"
          >
            Editar video
          </Link>
        </nav>
      </div>
    </header>
  );
}
