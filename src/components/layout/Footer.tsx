export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-sm">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <span className="font-medium">
            <span className="text-white">clip</span>
            <span className="text-violet-400">cut</span>
          </span>
          . Todos los derechos reservados.
        </p>
        <p>Procesamiento 100% en tu navegador &mdash; tus videos nunca salen de tu dispositivo.</p>
      </div>
    </footer>
  );
}
