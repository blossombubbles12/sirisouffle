import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export interface ScrollProductViewerProps {
  frames: string[];
  className?: string;
  label?: string;
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

  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

export function ScrollProductViewer({
  frames,
  className = '',
  label = 'Scroll to explore the product',
}: ScrollProductViewerProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<FrameImage[]>([]);
  const currentFrameRef = useRef(0);
  const pendingFrameRef = useRef<number | null>(null);
  const drawRequestRef = useRef<number | null>(null);

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
  }, [frames]);

  return (
    <section
      ref={sectionRef}
      className={`relative h-[280vh] ${className}`}
      aria-label="Scroll-controlled product viewer"
    >
      <div className="sticky top-0 flex h-[100svh] min-h-[620px] items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-[1180px] px-5 md:px-10">
          <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(72vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d7a35f]/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[10%] left-1/2 h-8 w-[min(52vw,460px)] -translate-x-1/2 rounded-[50%] bg-[#4c382c]/20 blur-2xl" />
          <canvas
            ref={canvasRef}
            className="relative z-10 mx-auto aspect-[16/9] w-full"
            role="img"
            aria-label={label}
          />
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap text-center text-[#394a35]/65">
            <span className="eyebrow !text-[9px]">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#c87046] align-middle" />
              {label}
            </span>
          </div>
          <div className="pointer-events-none absolute left-1/2 top-[7%] z-20 -translate-x-1/2 text-center text-[#394a35]/45">
            <span className="font-mono text-[10px] tracking-[.2em]">01 — 220</span>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-20 -translate-x-1/2 pb-7 text-center text-[#394a35]/50">
        <span className="eyebrow !text-[9px]">keep scrolling</span>
      </div>
    </section>
  );
}