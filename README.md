# clipcut ✂️

> Editor de video online gratuito, sin marcas de agua y sin registro. Procesamiento 100% en el navegador.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)
![FFmpeg.wasm](https://img.shields.io/badge/FFmpeg.wasm-0.12-green?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-violet?style=flat-square)

---

## ¿Qué es clipcut?

**clipcut** es un SaaS de edición de video enfocado en clips cortos. El usuario entra, sube su video, lo edita con cualquiera de las 18 herramientas disponibles y lo descarga — todo sin crear una cuenta y sin marcas de agua.

El modelo de negocio es simple: antes de cada descarga se muestra un anuncio de ~10 segundos (saltable a los 5s). Eso es todo.

### Principios del proyecto

- **Sin registro** — cualquier persona puede usar la herramienta de inmediato
- **Sin marcas de agua** — el resultado es limpio, listo para publicar
- **Sin servidor de procesamiento** — todo ocurre en el navegador del usuario mediante FFmpeg.wasm
- **Costo de infraestructura mínimo** — sin servidores de compute, sin almacenamiento de archivos de usuarios

---

## Características

### 18 herramientas de edición

| Categoría | Herramienta | Descripción |
|---|---|---|
| **Video** | Cortar (Trim) | Selecciona inicio y fin exacto con re-encodeo para A/V sync perfecto |
| **Video** | Velocidad | Cámara lenta o rápida (0.25x – 2x) con filtros `setpts` y `atempo` |
| **Video** | Rotar / Voltear | Rotación 90°/180°/270° y espejo horizontal/vertical |
| **Video** | Invertir | Reproduce el video al revés (`reverse` + `areverse`) |
| **Video** | Loop | Repite el video N veces en un solo archivo |
| **Video** | FPS | Cambia los fotogramas por segundo (15, 24, 30, 60 o personalizado) |
| **Audio** | Audio | Silenciar video o extraer audio en MP3 (re-encodeo con `libmp3lame`) |
| **Audio** | Volumen | Ajusta el nivel de audio de 0% a 300% |
| **Audio** | Reducir ruido | Filtro `afftdn` para eliminar ruido de fondo ambiental |
| **Visual** | Recortar (Crop) | Recorta el área del video con presets (16:9, 9:16, 1:1, 4:3) y valores manuales |
| **Visual** | Color | Ajusta brillo, contraste y saturación con el filtro `eq` |
| **Visual** | Fade | Efecto de entrada/salida suave (fade in/out) en video y audio |
| **Visual** | Texto | Overlay de texto con fuente, tamaño, color, posición y rango de tiempo |
| **Exportar** | Comprimir | Re-encodeo con `libx264` en tres niveles de calidad |
| **Exportar** | Convertir formato | Convierte entre MP4, WebM, MOV y AVI |
| **Exportar** | GIF animado | Proceso en dos pasos (paleta + encodeo) para máxima calidad de color |
| **Exportar** | Capturar frame | Extrae un fotograma del video como imagen PNG |
| **Combinar** | Unir videos | Concatena múltiples clips con reordenamiento y el demuxer `concat` |

### Monetización

- **Flujo**: usuario sube → edita → presiona "Procesar y descargar" → ve un anuncio 10s (saltable a los 5s) → descarga
- **Red publicitaria**: Google AdSense (espacio preparado en `AdModal.tsx`, listo para insertar el snippet)
- El anuncio se muestra en el momento de mayor compromiso del usuario (ya invirtió tiempo editando)

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.3 |
| Lenguaje | TypeScript | 5 |
| Estilos | Tailwind CSS | v4 |
| Procesamiento de video | @ffmpeg/ffmpeg + @ffmpeg/util | 0.12.x |
| Runtime de FFmpeg | @ffmpeg/core (WebAssembly) | 0.12.6 |
| Fuente tipográfica | Roboto (jsDelivr CDN) | — |
| Hosting recomendado | Vercel | — |

---

## Arquitectura

```
clipcut/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page (hero + features + CTA)
│   │   ├── layout.tsx            # Layout global con metadata SEO
│   │   ├── globals.css           # Estilos globales (Tailwind v4)
│   │   └── editor/
│   │       └── page.tsx          # Página del editor (Client Component)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Navbar sticky con logo y CTA
│   │   │   └── Footer.tsx        # Footer con nota de privacidad
│   │   ├── ui/
│   │   │   ├── Button.tsx        # Botón reutilizable (4 variantes, 3 tamaños)
│   │   │   └── ProgressBar.tsx   # Barra de progreso animada
│   │   ├── editor/
│   │   │   ├── VideoUploader.tsx # Zona drag & drop con validación de formato/tamaño
│   │   │   ├── VideoPlayer.tsx   # Reproductor con metadatos (resolución, duración, tamaño)
│   │   │   ├── Toolbar.tsx       # Barra de herramientas categorizada (18 tools)
│   │   │   └── panels/           # Panel de configuración por herramienta (18 archivos)
│   │   │       ├── TrimPanel.tsx
│   │   │       ├── SpeedPanel.tsx
│   │   │       ├── CropPanel.tsx
│   │   │       ├── AudioPanel.tsx
│   │   │       ├── CompressPanel.tsx
│   │   │       ├── FormatPanel.tsx
│   │   │       ├── RotatePanel.tsx
│   │   │       ├── ColorPanel.tsx
│   │   │       ├── ReversePanel.tsx
│   │   │       ├── VolumePanel.tsx
│   │   │       ├── FadePanel.tsx
│   │   │       ├── LoopPanel.tsx
│   │   │       ├── ExtractFramePanel.tsx
│   │   │       ├── GifPanel.tsx
│   │   │       ├── FpsPanel.tsx
│   │   │       ├── JoinPanel.tsx
│   │   │       ├── TextPanel.tsx
│   │   │       └── NoisePanel.tsx
│   │   └── ads/
│   │       └── AdModal.tsx       # Modal de anuncio previo a la descarga
│   │
│   ├── hooks/
│   │   ├── useFFmpeg.ts          # Carga y estado de la instancia FFmpeg.wasm
│   │   └── useVideoEditor.ts     # Estado global del editor (todas las herramientas)
│   │
│   ├── lib/
│   │   ├── ffmpeg/
│   │   │   ├── commands.ts       # Constructores de argumentos FFmpeg por herramienta
│   │   │   └── processor.ts      # Orquestación del procesamiento + limpieza del FS virtual
│   │   └── utils.ts              # formatTime, formatFileSize, getVideoDimensions, etc.
│   │
│   └── types/
│       └── editor.ts             # Tipos TypeScript: EditorState, ToolType, settings por tool
│
├── next.config.ts                # Headers COOP/COEP requeridos para SharedArrayBuffer
├── postcss.config.mjs
├── tailwind.config  (inline v4)
├── tsconfig.json
└── package.json
```

### Decisiones de arquitectura

**¿Por qué todo en el cliente?**
FFmpeg.wasm permite ejecutar FFmpeg compilado a WebAssembly directamente en el navegador. Esto elimina la necesidad de servidores de procesamiento, reduciendo el costo de infraestructura a prácticamente $0. El video nunca sale del dispositivo del usuario.

**¿Por qué no hay base de datos?**
El modelo no lo requiere. No hay cuentas, no hay historial, no hay proyectos guardados. Cada sesión es efímera por diseño.

**Headers COOP/COEP**
FFmpeg.wasm necesita `SharedArrayBuffer` para funcionar, lo que requiere que el servidor envíe estos headers HTTP:
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```
Están configurados en `next.config.ts` para todas las rutas.

**Limpieza del sistema de archivos virtual**
FFmpeg.wasm mantiene un sistema de archivos en memoria (FS virtual). Si un procesamiento falla y los archivos no se eliminan, los siguientes intentos fallan al intentar escribir el mismo nombre. Toda la lógica de procesamiento usa `try/finally` para garantizar la limpieza.

---

## Instalación y desarrollo

### Requisitos

- Node.js 18+
- npm 9+

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/Joselois1/clipcut.git
cd clipcut

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con Turbopack
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

---

## Deploy en Vercel

El proyecto está optimizado para Vercel. Solo conecta el repositorio y despliega — los headers COOP/COEP ya están configurados en `next.config.ts`.

```bash
# Con Vercel CLI
npx vercel --prod
```

> **Importante**: Vercel free tier es suficiente para empezar. El procesamiento ocurre en el cliente, no en el servidor de Vercel.

---

## Integrar Google AdSense

1. Crea una cuenta en [Google AdSense](https://adsense.google.com) y añade tu dominio
2. Una vez aprobado, abre `src/components/ads/AdModal.tsx`
3. Reemplaza el bloque de placeholder con tu código de anuncio:

```tsx
{/* Reemplazar este bloque con tu código de AdSense */}
<ins className="adsbygoogle"
  style={{ display: "block" }}
  data-ad-client="ca-pub-XXXXXXXXXX"
  data-ad-slot="XXXXXXXXXX"
  data-ad-format="auto"
/>
```

4. Añade el script de AdSense en `src/app/layout.tsx`

---

## Formatos soportados

| Formato | Entrada | Salida |
|---|---|---|
| MP4 | ✅ | ✅ |
| WebM | ✅ | ✅ |
| MOV | ✅ | ✅ |
| AVI | ✅ | ✅ |
| MP3 | — | ✅ (extracción de audio) |
| GIF | — | ✅ (exportación) |
| PNG | — | ✅ (captura de frame) |

**Tamaño máximo**: 500 MB por archivo (límite configurable en `VideoUploader.tsx`)

---

## Notas técnicas

- **Texto overlay**: La primera vez que se usa la herramienta de texto, descarga la fuente Roboto (~150KB) desde jsDelivr y la escribe en el FS virtual de FFmpeg. Las ejecuciones siguientes la reutilizan.
- **GIF**: Usa un proceso de dos pasos (generación de paleta con `palettegen` + codificación con `paletteuse`) para obtener la mayor calidad de color posible. Se recomienda limitar los GIFs a 10 segundos.
- **Invertir video**: Carga todos los frames en memoria RAM. Para videos largos (>60s) puede ser lento o fallar en dispositivos con poca memoria. El panel muestra una advertencia automática.
- **Unir videos**: Usa el demuxer `concat` de FFmpeg con `-c copy` para una concatenación sin re-encodeo y sin pérdida de calidad.

---

## Licencia

MIT © 2025 clipcut
