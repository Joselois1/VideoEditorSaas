export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-sm">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <span className="font-semibold">
            <span className="text-white">clip</span>
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">
              cut
            </span>
          </span>
          . Todos los derechos reservados.
        </p>
        <p>Procesamiento 100% en tu navegador &mdash; tus videos nunca salen de tu dispositivo.</p>
      </div>
    </footer>
  );
}
