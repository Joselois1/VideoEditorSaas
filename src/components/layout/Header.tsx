import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white tracking-tight">
            clip<span className="text-violet-500">cut</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/#features" className="hover:text-white transition-colors">
            Funciones
          </Link>
          <Link
            href="/editor"
            className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-full font-medium transition-colors"
          >
            Editar video
          </Link>
        </nav>
      </div>
    </header>
  );
}
