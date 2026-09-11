import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

export interface ScrollProductViewerProps {
  frames: string[];
  className?: string;
  label?: string;
  phases?: ScrollProductPhase[];
}

export interface ScrollProductPhase {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

type FrameImage = HTMLImageElement | undefined;

function drawFrame(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const context = canvas.getContext('2d');
  if (!context) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth || 800;
  const height = canvas.clientHeight || 450;
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.clearRect(0, 0, width, height);

  // The source frames are 16:9. Covering the viewport removes the hard
  // rectangle around the source background while keeping the jar centered.
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

const defaultPhases: ScrollProductPhase[] = [
  {
    eyebrow: '01 / the shell',
    title: 'A jar with nothing to hide.',
    body: 'A deep glass silhouette, finished simply so the quality inside does the talking.',
    ctaLabel: 'See the finish',
    ctaHref: '#product-notes',
  },
  {
    eyebrow: '02 / the texture',
    title: 'Whipped for the slow melt.',
    body: 'Airy, cushiony, and hand-finished — the first touch turns from balm to silk.',
    ctaLabel: 'Feel the texture',
    ctaHref: '#product-notes',
  },
  {
    eyebrow: '03 / the ritual',
    title: 'Richness without the weight.',
    body: 'A small scoop warms between your palms and leaves skin soft, never crowded.',
    ctaLabel: 'Meet the ritual',
    ctaHref: '#product-notes',
  },
  {
    eyebrow: '04 / the top view',
    title: 'The proof is in the swirl.',
    body: 'A slow, generous whip that keeps its shape until the moment it meets your skin.',
    ctaLabel: 'Keep it close',
    ctaHref: '#product-notes',
  },
];

export function ScrollProductViewer({
  frames,
  className = '',
  label = 'Scroll to explore the product',
  phases = defaultPhases,
}: ScrollProductViewerProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<FrameImage[]>([]);
  const currentFrameRef = useRef(0);
  const pendingFrameRef = useRef<number | null>(null);
  const drawRequestRef = useRef<number | null>(null);
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas || frames.length === 0) return;

    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loaded = new Set<number>();
    const images = Array.from({ length: frames.length }, () => undefined as FrameImage);
    imagesRef.current = images;

    const drawLoadedFrame = (index: number) => {
      const image = images[index];
      if (!image) return;
      currentFrameRef.current = index;
      drawFrame(canvas, image);
    };

    const requestDraw = (index: number) => {
      pendingFrameRef.current = index;
      if (drawRequestRef.current !== null) return;
      drawRequestRef.current = window.requestAnimationFrame(() => {
        drawRequestRef.current = null;
        const nextFrame = pendingFrameRef.current;
        if (nextFrame === null) return;

        if (loaded.has(nextFrame)) {
          drawLoadedFrame(nextFrame);
          return;
        }

        // Keep the last frame visible while the requested frame finishes loading.
        const nearestLoaded = [...loaded].sort(
          (a, b) => Math.abs(a - nextFrame) - Math.abs(b - nextFrame),
        )[0];
        if (nearestLoaded !== undefined) drawLoadedFrame(nearestLoaded);
      });
    };

    const loadFrame = (index: number) => {
      if (index < 0 || index >= frames.length || images[index]) return;
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        images[index] = image;
        loaded.add(index);
        if (index === 0 || pendingFrameRef.current === index) requestDraw(index);
      };
      image.src = frames[index];
    };

    loadFrame(0);
    let preloadIndex = 1;
    let preloadTimer = 0;
    const preloadNext = () => {
      if (preloadIndex >= frames.length) return;
      loadFrame(preloadIndex);
      preloadIndex += 1;
      preloadTimer = window.setTimeout(preloadNext, 12);
    };
    preloadTimer = window.setTimeout(preloadNext, 0);

    const resizeObserver = new ResizeObserver(() => {
      const image = images[currentFrameRef.current];
      if (image) drawFrame(canvas, image);
    });
    resizeObserver.observe(canvas);

    let trigger: ScrollTrigger | undefined;
    if (!reducedMotion) {
      trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.12,
        onUpdate: (self) => {
          const nextPhase = Math.min(
            phases.length - 1,
            Math.floor(self.progress * phases.length),
          );
          setActivePhase((current) => (current === nextPhase ? current : nextPhase));
          const nextFrame = Math.min(
            frames.length - 1,
            Math.round(self.progress * (frames.length - 1)),
          );
          if (nextFrame !== currentFrameRef.current) {
            requestDraw(nextFrame);
            // Prioritize the frame the user is currently asking for.
            loadFrame(nextFrame);
          }
        },
      });
    } else {
      section.dataset.reducedMotion = 'true';
    }

    return () => {
      trigger?.kill();
      resizeObserver.disconnect();
      window.clearTimeout(preloadTimer);
      if (drawRequestRef.current !== null) {
        window.cancelAnimationFrame(drawRequestRef.current);
      }
      imagesRef.current = [];
    };
  }, [frames, phases.length]);

  const phase = phases[Math.min(activePhase, phases.length - 1)] ?? defaultPhases[0];

  return (
    <section
      ref={sectionRef}
      className={`relative h-[300vh] ${className}`}
      aria-label="Scroll-controlled product viewer"
    >
      <div className="sticky top-0 flex h-[100svh] min-h-[620px] items-center justify-center overflow-hidden bg-[#f5eddc]">
        <div className="relative h-full w-full">
          <div className="pointer-events-none absolute inset-0 z-20 bg-[#f5eddc]/10 mix-blend-color" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[38%] bg-gradient-to-t from-[#f5eddc]/80 via-[#f5eddc]/20 to-transparent" />
          <canvas
            ref={canvasRef}
            className="relative z-10 h-full w-full mix-blend-multiply"
            role="img"
            aria-label={label}
          />
          <div
            key={activePhase}
            className="product-phase-in absolute inset-x-4 bottom-4 z-30 rounded-[22px] border border-[#394a35]/15 bg-[#f5eddc] p-5 text-[#394a35] shadow-[0_18px_50px_rgba(57,74,53,.16)] md:bottom-[12%] md:left-[6%] md:right-auto md:max-w-[390px] md:p-6"
            aria-live="polite"
          >
            <span className="eyebrow text-[#52634b]/75">{phase.eyebrow}</span>
            <h2 className="display mt-3 text-[clamp(2.35rem,4vw,4.4rem)] leading-[.86]">
              {phase.title}
            </h2>
            <p className="mt-4 max-w-[310px] text-sm leading-[1.6] text-[#52634b]/80">
              {phase.body}
            </p>
            <a
              href={phase.ctaHref}
              className="button-sheen focus-ring mt-6 inline-flex items-center gap-3 rounded-full bg-[#394a35] px-5 py-3 text-xs font-semibold text-[#f5eddc] transition hover:-translate-y-1"
            >
              {phase.ctaLabel}
              <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="pointer-events-none absolute right-5 top-[8%] z-30 text-right text-[#394a35]/55 md:right-[7%]">
            <span className="eyebrow !text-[9px]">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#c87046] align-middle" />
              {label}
            </span>
            <span className="mt-3 block font-mono text-[10px] tracking-[.2em]">01 — 220</span>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-20 -translate-x-1/2 pb-7 text-center text-[#394a35]/50">
        <span className="eyebrow !text-[9px]">keep scrolling</span>
      </div>
    </section>
  );
}