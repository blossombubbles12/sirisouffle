import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ScrollProductViewer } from '@/components/ScrollProductViewer';
import NotFound from '@/pages/not-found';
import { ArrowDown, ArrowUpRight, ChevronDown, CircleCheck, Droplets, Instagram, Leaf, Menu, Minus, Move3d, Plus, ShoppingBag, Sparkles, Sun, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const queryClient = new QueryClient();
const productFrames = Array.from(
  { length: 220 },
  (_, index) => `/product-frames/frame_${String(index).padStart(3, '0')}.webp`,
);

function ProductCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true });
    if (!context) {
      mount.dataset.fallback = 'true';
      return;
    }
    const renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      alpha: true,
      antialias: true,
    });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0.55, 6.8);
    const group = new THREE.Group();
    scene.add(group);
    scene.add(new THREE.HemisphereLight(0xfff3d4, 0x314536, 2.2));
    const key = new THREE.DirectionalLight(0xffd2a0, 4);
    key.position.set(-3, 4, 4);
    scene.add(key);
    const fill = new THREE.PointLight(0xf0a35d, 1.2, 12);
    fill.position.set(3, 1, 2);
    scene.add(fill);

    const jarMaterial = new THREE.MeshPhysicalMaterial({ color: 0xd6a878, roughness: 0.31, metalness: 0.03, clearcoat: 0.2 });
    const butterMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffdfa3, roughness: 0.52, metalness: 0 });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x394a35, roughness: 0.34 });
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.12, 1.65, 64), jarMaterial);
    jar.position.y = -0.15;
    group.add(jar);
    const butter = new THREE.Mesh(new THREE.CylinderGeometry(1.09, 1.07, 0.12, 64), butterMaterial);
    butter.position.y = 0.7;
    group.add(butter);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.19, 0.06, 16, 64), darkMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.74;
    group.add(rim);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(1.31, 1.28, 0.23, 64), darkMaterial);
    lid.position.y = 0.94;
    group.add(lid);
    const label = new THREE.Mesh(new THREE.CylinderGeometry(1.255, 1.255, 0.56, 64, 1, true, 0.42, 5.35), new THREE.MeshStandardMaterial({ color: 0xe9d8ac, roughness: 0.7 }));
    label.rotation.z = Math.PI / 2;
    label.position.y = -0.18;
    group.add(label);
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.65, 64), new THREE.MeshBasicMaterial({ color: 0x3c3024, transparent: true, opacity: 0.24 }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.12;
    shadow.scale.set(1.25, .55, 1);
    scene.add(shadow);
    const handleMove = (event: PointerEvent) => {
      if (reduced) return;
      const rect = mount.getBoundingClientRect();
      group.rotation.y = ((event.clientX - rect.left) / rect.width - .5) * .48;
      group.rotation.x = ((event.clientY - rect.top) / rect.height - .5) * -.16;
    };
    mount.appendChild(renderer.domElement);
    mount.addEventListener('pointermove', handleMove);
    const resize = () => {
      const width = mount.clientWidth || 500;
      const height = mount.clientHeight || 500;
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    let frame = 0;
    const render = () => {
      if (!reduced) {
        group.rotation.y += (0.08 - group.rotation.y) * 0.008;
        group.position.y = Math.sin(frame * .014) * .045;
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      mount.removeEventListener('pointermove', handleMove);
      renderer.dispose();
      [jar, butter, rim, lid, label, shadow].forEach((mesh) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose());
        else mesh.material.dispose();
      });
    };
  }, []);

  return (
    <div className="product-canvas relative h-[min(78vw,620px)] min-h-[390px] w-full" ref={mountRef} aria-label="Interactive 3D view of the NŌR / shea jar">
      <div className="pointer-events-none absolute inset-0 m-auto h-[64%] w-[64%] rounded-full bg-[#e4ad67]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[11%] left-1/2 h-7 w-[48%] -translate-x-1/2 rounded-[50%] bg-[#4c382c]/20 blur-xl" />
      <div className="pointer-events-none absolute bottom-[7%] left-1/2 flex -translate-x-1/2 items-center gap-2 text-[#52634b]/65">
        <Move3d size={14} strokeWidth={1.5} />
        <span className="eyebrow !text-[9px]">move to explore</span>
      </div>
      <div className="product-fallback pointer-events-none absolute inset-0 m-auto h-[290px] w-[250px] rounded-[28px] border border-[#52634b]/20 bg-[#d5a878] shadow-[0_28px_45px_rgba(69,47,28,.18)]">
        <div className="absolute inset-x-3 top-2 h-10 rounded-full bg-[#394a35]" />
        <div className="absolute left-1/2 top-[42%] w-[92%] -translate-x-1/2 -rotate-90 border-y border-[#a37c52] py-5 text-center">
          <span className="display text-xl text-[#394a35]">NŌR / shea</span>
        </div>
      </div>
    </div>
  );
}

function Header({ onBag }: { onBag: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = ['story', 'ritual', 'ingredients', 'journal'];
  return (
    <header className="absolute left-0 right-0 top-0 z-30">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 md:px-10 md:py-7">
        <a href="#top" className="focus-ring flex items-center gap-2" data-testid="link-brand">
          <span className="display text-[26px] leading-none tracking-[-.06em]">NŌR</span>
          <span className="mt-1 text-[10px] font-medium tracking-[.2em] text-[#d7a35f]">/ SHEA</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {nav.map((item) => <a key={item} href={`#${item}`} className="focus-ring eyebrow text-[#394a35]/75 transition-colors hover:text-[#394a35]" data-testid={`link-nav-${item}`}>{item}</a>)}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/product" className="focus-ring hidden items-center gap-2 text-[#394a35]/75 transition hover:text-[#394a35] md:inline-flex" data-testid="link-nav-product">
            <span className="eyebrow !text-[9px]">view product</span>
            <ArrowUpRight size={14} />
          </Link>
          <button onClick={onBag} className="focus-ring group relative flex items-center gap-2 rounded-full border border-[#394a35]/25 px-4 py-2.5 text-[#394a35] transition hover:bg-[#394a35] hover:text-[#f5eddc]" data-testid="button-open-bag">
            <ShoppingBag size={15} strokeWidth={1.7} />
            <span className="eyebrow !text-[9px]">ritual bag</span>
          </button>
          <button onClick={() => setMenuOpen((current) => !current)} className="focus-ring rounded-full border border-[#394a35]/25 p-2.5 md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} data-testid="button-toggle-menu">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {menuOpen && <nav className="mx-5 grid gap-1 rounded-2xl border border-[#394a35]/15 bg-[#f5eddc]/95 p-3 shadow-xl backdrop-blur md:hidden" aria-label="Mobile navigation">
        {nav.map((item) => <a onClick={() => setMenuOpen(false)} key={item} href={`#${item}`} className="rounded-xl px-4 py-3 text-sm capitalize text-[#394a35] hover:bg-[#e9dec9]" data-testid={`link-mobile-${item}`}>{item}</a>)}
        <Link onClick={() => setMenuOpen(false)} href="/product" className="rounded-xl px-4 py-3 text-sm capitalize text-[#394a35] hover:bg-[#e9dec9]" data-testid="link-mobile-product">view product</Link>
      </nav>}
    </header>
  );
}

function SectionLabel({ number, children, light = false }: { number: string; children: ReactNode; light?: boolean }) {
  return <div className={`eyebrow flex items-center gap-3 ${light ? 'text-[#f1dfc0]/70' : 'text-[#52634b]/75'}`}><span>{number}</span><span className="h-px w-8 bg-current opacity-50" /><span>{children}</span></div>;
}

function Home() {
  const [quantity, setQuantity] = useState(1);
  const [bagOpen, setBagOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = revealRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element, index) => {
        gsap.fromTo(element, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: .85, delay: index % 3 * .08, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
      });
      gsap.to('.story-image', { yPercent: -9, ease: 'none', scrollTrigger: { trigger: '.story-image-wrap', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.ritual-orbit', { rotation: 360, duration: 50, repeat: -1, ease: 'none' });
    }, root);
    return () => ctx.revert();
  }, []);

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <div ref={revealRef} className="grain min-h-[100dvh] bg-[#f5eddc] text-[#394a35]">
      <Header onBag={() => setBagOpen(true)} />
      {bagOpen && <aside className="fixed right-0 top-0 z-50 flex h-[100dvh] w-full max-w-md flex-col bg-[#394a35] p-6 text-[#f5eddc] shadow-2xl" aria-label="Ritual bag">
        <div className="flex items-center justify-between border-b border-[#f5eddc]/20 pb-5">
          <div><p className="eyebrow text-[#d7a35f]">your ritual bag</p><h2 className="display mt-2 text-3xl">A little grounding.</h2></div>
          <button onClick={() => setBagOpen(false)} className="focus-ring rounded-full border border-[#f5eddc]/30 p-2" aria-label="Close ritual bag" data-testid="button-close-bag"><X size={18} /></button>
        </div>
        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="border-y border-[#f5eddc]/20 py-6">
            <div className="flex items-start justify-between gap-5">
              <div><p className="display text-2xl">The Daily Butter</p><p className="mt-1 text-sm text-[#f5eddc]/65">Raw shea · 120g glass jar</p></div>
              <p className="font-mono text-sm">$28.00</p>
            </div>
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="text-[#f5eddc]/60">Quantity</span>
              <div className="flex items-center gap-4 rounded-full border border-[#f5eddc]/25 px-3 py-1">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="focus-ring" aria-label="Decrease quantity" data-testid="button-decrease-quantity"><Minus size={14} /></button>
                <span data-testid="text-bag-quantity">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="focus-ring" aria-label="Increase quantity" data-testid="button-increase-quantity"><Plus size={14} /></button>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-between text-sm"><span className="text-[#f5eddc]/60">Subtotal</span><span className="font-mono">${(28 * quantity).toFixed(2)}</span></div>
        </div>
        <button className="button-sheen focus-ring flex w-full items-center justify-center gap-3 rounded-full bg-[#d7a35f] py-4 text-sm font-semibold text-[#394a35] transition hover:bg-[#edc486]" data-testid="button-bag-note">Keep this ritual close <ArrowUpRight size={16} /></button>
        <p className="mt-4 text-center text-xs text-[#f5eddc]/45">No checkout here — just a quiet reminder.</p>
      </aside>}

      <main id="top">
        <section className="relative min-h-[760px] overflow-hidden bg-[#eadcc3] px-5 pb-20 pt-36 md:min-h-[860px] md:px-10 md:pt-44" aria-labelledby="hero-heading">
          <div className="absolute -right-24 top-24 h-[440px] w-[440px] rounded-full bg-[#d7a35f]/35 blur-3xl md:h-[650px] md:w-[650px]" />
          <div className="absolute bottom-0 left-0 h-[42%] w-full bg-[#e2cfab]/35 [clip-path:ellipse(75%_55%_at_40%_100%)]" />
          <div className="relative z-10 mx-auto grid max-w-[1440px] items-center gap-6 md:grid-cols-[.88fr_1.12fr]">
            <div className="max-w-[620px]">
              <div className="rise-in flex items-center gap-3 text-[#52634b]"><span className="eyebrow">small-batch body care</span><span className="h-px w-14 bg-[#52634b]/50" /><span className="eyebrow">made in Accra · worn everywhere</span></div>
              <h1 id="hero-heading" className="display rise-in delay-1 mt-7 max-w-[650px] text-[clamp(4.6rem,12vw,10.5rem)] leading-[.78] text-[#394a35]">Keep<br /><em className="text-[#c87046]">close</em><span className="text-[#d7a35f]">.</span></h1>
              <p className="rise-in delay-2 mt-8 max-w-[430px] text-[17px] leading-[1.6] text-[#52634b]">A daily shea butter made for the moments between. Warm skin. Slow hands. Nothing extra.</p>
              <div className="rise-in delay-3 mt-9 flex flex-wrap items-center gap-5">
                <a href="#ritual" className="button-sheen focus-ring inline-flex items-center gap-3 rounded-full bg-[#394a35] px-6 py-3.5 text-sm font-semibold text-[#f5eddc] transition hover:-translate-y-1" data-testid="link-hero-ritual">Meet the butter <ArrowDown size={16} /></a>
                <a href="#story" className="focus-ring inline-flex items-center gap-2 text-sm font-medium text-[#394a35] underline decoration-[#d7a35f] underline-offset-8" data-testid="link-hero-story">Our point of origin <ArrowUpRight size={15} /></a>
              </div>
            </div>
            <div className="rise-in delay-2 relative -mx-5 md:mx-0"><ProductCanvas /><div className="absolute right-[9%] top-[14%] hidden max-w-[120px] rotate-6 text-right text-[#52634b] md:block"><p className="display text-2xl leading-none">whipped<br />by hand</p><span className="mt-2 block h-px w-10 bg-[#52634b]/50 ml-auto" /></div></div>
          </div>
          <div className="absolute bottom-8 left-5 right-5 flex items-center justify-between border-t border-[#394a35]/15 pt-4 md:left-10 md:right-10"><span className="eyebrow text-[#52634b]/70">01 / 05</span><span className="eyebrow text-[#52634b]/70">scroll to soften <ArrowDown className="ml-2 inline" size={12} /></span></div>
        </section>

        <section id="story" className="relative overflow-hidden bg-[#394a35] px-5 py-24 text-[#f5eddc] md:px-10 md:py-36">
          <div className="mx-auto grid max-w-[1440px] gap-14 md:grid-cols-[.9fr_1.1fr] md:items-center">
            <div data-reveal className="story-image-wrap relative order-2 aspect-[.82] max-h-[710px] overflow-hidden rounded-t-[48%] rounded-b-[12px] md:order-1">
              <img src="/shea-origin.jpg" alt="Raw shea nuts and folded linen in golden hour light" className="story-image h-[118%] w-full object-cover object-center" />
              <div className="absolute inset-0 bg-[#394a35]/15" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between"><span className="eyebrow text-[#f5eddc]/75">01 — the source</span><span className="eyebrow text-[#f5eddc]/75">09° 03′ N</span></div>
            </div>
            <div className="order-1 md:order-2" data-reveal>
              <SectionLabel number="01" light>the source</SectionLabel>
              <h2 className="display mt-7 max-w-[620px] text-[clamp(3.6rem,7vw,7.5rem)] leading-[.83]">Before it is<br /><em className="text-[#d7a35f]">beautiful,</em><br />it is a tree.</h2>
              <p className="mt-9 max-w-[430px] text-[16px] leading-[1.75] text-[#f5eddc]/70">NŌR begins beneath the shea trees of Northern Ghana, where the karité fruit ripens slowly under an open sky. We buy directly from women-led cooperatives, then let the nut keep its story: pressed, purified, and left gloriously simple.</p>
              <a href="#ingredients" className="focus-ring mt-9 inline-flex items-center gap-3 border-b border-[#d7a35f]/60 pb-3 text-sm text-[#d7a35f]" data-testid="link-story-ingredients">Trace the ingredient <ArrowUpRight size={15} /></a>
            </div>
          </div>
        </section>

        <section id="ritual" className="relative overflow-hidden bg-[#f5eddc] px-5 py-24 md:px-10 md:py-36">
          <div className="mx-auto max-w-[1440px]">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end" data-reveal>
              <div><SectionLabel number="02">the ritual</SectionLabel><h2 className="display mt-6 max-w-[800px] text-[clamp(3.4rem,7vw,7.3rem)] leading-[.82]">Melt it.<br /><em className="text-[#c87046]">Mean it.</em></h2></div>
              <p className="max-w-[280px] text-sm leading-[1.7] text-[#52634b]/80">The good kind of repetition. A palmful after the shower, before the day, whenever skin asks for a little more.</p>
            </div>
            <div className="relative mt-20 grid gap-10 md:grid-cols-[1.2fr_.8fr] md:items-end">
              <div className="relative aspect-[1.2] overflow-hidden rounded-[20px] bg-[#dec49d]" data-reveal>
                <img src="/shea-texture.jpg" alt="Close-up of the smooth whipped texture of NŌR shea butter" className="h-full w-full object-cover mix-blend-multiply opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#c87046]/25 to-transparent" />
                <div className="absolute left-7 top-7 max-w-[190px]"><p className="display text-4xl leading-none text-[#394a35]">softness,<br /><em>without<br />the fuss.</em></p></div>
                <div className="absolute bottom-6 right-7 flex items-center gap-2 text-[#394a35]/70"><Droplets size={15} /><span className="eyebrow !text-[9px]">a little goes a long way</span></div>
              </div>
              <div className="relative min-h-[370px] rounded-[20px] bg-[#d7a35f] p-8 md:p-10" data-reveal>
                <div className="ritual-orbit absolute -right-12 -top-12 h-44 w-44 rounded-full border border-dashed border-[#394a35]/30" /><div className="absolute right-4 top-4 text-[#394a35]/50"><Sun size={22} strokeWidth={1.4} /></div>
                <span className="eyebrow text-[#394a35]/70">your three-minute reset</span>
                <ol className="mt-14 space-y-7">
                  {[['01', 'Warm', 'Press between your palms until it turns to silk.'], ['02', 'Work in', 'Massage into damp skin, slowly — ankles to collarbone.'], ['03', 'Stay', 'Take one breath before you reach for the towel.']].map(([number, title, body]) => <li key={number} className="flex gap-5 border-t border-[#394a35]/20 pt-4"><span className="font-mono text-xs text-[#394a35]/55">{number}</span><div><h3 className="display text-3xl">{title}</h3><p className="mt-1 max-w-[205px] text-sm leading-[1.55] text-[#394a35]/75">{body}</p></div></li>)}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section id="ingredients" className="bg-[#c87046] px-5 py-24 text-[#f8ecd5] md:px-10 md:py-32">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-12 md:grid-cols-[.8fr_1.2fr] md:items-start">
              <div data-reveal><SectionLabel number="03" light>the formula</SectionLabel><h2 className="display mt-6 text-[clamp(3.3rem,7vw,7rem)] leading-[.82]">Three<br />things.<br /><em className="text-[#f1c681]">That’s it.</em></h2><p className="mt-8 max-w-[300px] text-sm leading-[1.7] text-[#f8ecd5]/75">No perfume cloud. No filler. Just a considered trio that knows how to do its job.</p></div>
              <div className="grid gap-0 border-t border-[#f8ecd5]/30" data-reveal>
                {[{ icon: Leaf, name: 'Raw shea butter', note: 'The anchor', copy: 'Unrefined and slow-milled for skin-loving fatty acids, vitamins A and E, and a naturally nutty finish.' }, { icon: Sun, name: 'Baobab oil', note: 'The bright note', copy: 'Cold-pressed from the tree of life. Lightweight, omega-rich, and quietly restorative.' }, { icon: Sparkles, name: 'Marula seed oil', note: 'The softener', copy: 'A few drops to make the whole ritual glide. Absorbs cleanly, leaves a low, lit-from-within sheen.' }].map(({ icon: Icon, name, note, copy }, index) => <article key={name} className="group flex gap-6 border-b border-[#f8ecd5]/30 py-8 transition hover:px-3"><div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#f8ecd5]/50"><Icon size={18} strokeWidth={1.4} /></div><div className="flex-1"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="display text-3xl">{name}</h3><span className="eyebrow text-[#f8ecd5]/60">{note}</span></div><p className="mt-3 max-w-[530px] text-sm leading-[1.65] text-[#f8ecd5]/75">{copy}</p></div><span className="font-mono text-xs text-[#f8ecd5]/55">0{index + 1}</span></article>)}
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-[#e2cfab] px-5 py-20 md:px-10 md:py-28" aria-label="Brand promise">
          <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap text-[#394a35]"><span className="display text-[clamp(4rem,9vw,9rem)]">nothing to hide</span><span className="h-3 w-3 rounded-full bg-[#c87046]" /><span className="display text-[clamp(4rem,9vw,9rem)] italic text-[#c87046]">nothing to prove</span><span className="h-3 w-3 rounded-full bg-[#394a35]" /><span className="display text-[clamp(4rem,9vw,9rem)]">nothing to hide</span><span className="h-3 w-3 rounded-full bg-[#c87046]" /><span className="display text-[clamp(4rem,9vw,9rem)] italic text-[#c87046]">nothing to prove</span></div>
        </section>

        <section className="bg-[#f5eddc] px-5 py-24 md:px-10 md:py-36">
          <div className="mx-auto grid max-w-[1440px] gap-14 md:grid-cols-[1fr_.85fr] md:items-center">
            <div data-reveal><SectionLabel number="04">the daily butter</SectionLabel><h2 className="display mt-6 max-w-[650px] text-[clamp(3.6rem,7vw,7.5rem)] leading-[.82]">Your skin,<br /><em className="text-[#c87046]">at ease.</em></h2><p className="mt-8 max-w-[440px] text-base leading-[1.7] text-[#52634b]/80">A generous 120g jar of raw, whipped shea for wherever your body asks for care. Keep it by the bed. Keep it in your bag. Keep it close.</p><div className="mt-9 flex items-center gap-5"><div className="flex items-center rounded-full border border-[#394a35]/25 p-1"><button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="focus-ring rounded-full p-2 hover:bg-[#e2cfab]" aria-label="Decrease product quantity" data-testid="button-product-decrease"><Minus size={14} /></button><span className="min-w-8 text-center font-mono text-sm" data-testid="text-product-quantity">{quantity}</span><button onClick={() => setQuantity((q) => q + 1)} className="focus-ring rounded-full p-2 hover:bg-[#e2cfab]" aria-label="Increase product quantity" data-testid="button-product-increase"><Plus size={14} /></button></div><span className="font-mono text-sm text-[#52634b]">${(28 * quantity).toFixed(2)}</span></div><button onClick={() => setBagOpen(true)} className="button-sheen focus-ring mt-7 flex items-center gap-3 rounded-full bg-[#394a35] px-7 py-4 text-sm font-semibold text-[#f5eddc] transition hover:-translate-y-1" data-testid="button-add-to-ritual">Add to your ritual <ShoppingBag size={16} /></button></div>
            <div className="relative" data-reveal><div className="absolute -inset-5 rounded-[50%] border border-[#c87046]/30" /><div className="aspect-square overflow-hidden rounded-[50%] bg-[#d7a35f]"><img src="/shea-texture.jpg" alt="NŌR shea butter with a sculptural whipped texture" className="h-full w-full object-cover mix-blend-multiply opacity-80" /></div><div className="absolute -bottom-5 -left-5 rounded-full bg-[#394a35] px-5 py-3 text-[#f5eddc] shadow-lg"><span className="eyebrow !text-[9px]">120g · unrefined · Ghana</span></div></div>
          </div>
        </section>

        <section id="journal" className="bg-[#eadcc3] px-5 py-24 md:px-10 md:py-32">
          <div className="mx-auto max-w-[1440px]"><div className="flex items-end justify-between gap-6" data-reveal><div><SectionLabel number="05">field notes</SectionLabel><h2 className="display mt-6 text-[clamp(3.3rem,6vw,6rem)] leading-[.85]">From the<br /><em className="text-[#c87046]">shea line.</em></h2></div><a href="#newsletter" className="focus-ring hidden items-center gap-2 text-sm underline decoration-[#c87046] underline-offset-8 md:flex" data-testid="link-all-notes">Read all notes <ArrowUpRight size={15} /></a></div>
            <div className="mt-16 grid gap-5 md:grid-cols-[1.2fr_.8fr_.8fr]">
              {[{ category: 'origin note', title: 'Why unrefined is the whole point.', copy: 'On keeping the nutty, golden parts that make shea feel like shea.', color: '#394a35' }, { category: 'body note', title: 'The elbows, knees, and other quiet places.', copy: 'A map of where to slow down.', color: '#d7a35f' }, { category: 'ritual note', title: 'A jar by the bedside.', copy: 'Three minutes that belong only to you.', color: '#c87046' }].map((note, index) => <article key={note.title} className={`group relative min-h-[300px] overflow-hidden rounded-[16px] p-7 ${index === 0 ? 'md:min-h-[390px]' : ''}`} style={{ backgroundColor: note.color }} data-reveal><div className="relative z-10 flex h-full flex-col justify-between text-[#f5eddc]"><span className="eyebrow opacity-70">{note.category}</span><div><h3 className="display max-w-[290px] text-4xl leading-[.9]">{note.title}</h3><p className="mt-4 max-w-[260px] text-sm leading-[1.5] opacity-70">{note.copy}</p><button className="focus-ring mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.1em]" data-testid={`button-read-note-${index}`}>Read note <ArrowUpRight size={14} /></button></div></div><div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full border border-[#f5eddc]/25 transition duration-500 group-hover:scale-125" /></article>)}
            </div>
          </div>
        </section>

        <section id="newsletter" className="bg-[#394a35] px-5 py-24 text-[#f5eddc] md:px-10 md:py-32">
          <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-[1fr_.8fr] md:items-end"><div data-reveal><SectionLabel number="06" light>stay close</SectionLabel><h2 className="display mt-7 max-w-[760px] text-[clamp(3.7rem,8vw,8rem)] leading-[.8]">Good things<br /><em className="text-[#d7a35f]">take time.</em></h2></div><div data-reveal><p className="mb-7 max-w-[310px] text-sm leading-[1.7] text-[#f5eddc]/70">Occasional field notes, new batches, and the small rituals that make a day feel more like yours.</p>{subscribed ? <div className="flex items-center gap-3 border-b border-[#f5eddc]/30 pb-4 text-[#d7a35f]" data-testid="status-subscribed"><CircleCheck size={18} /><span className="text-sm">You’re on the close list.</span></div> : <form onSubmit={submitNewsletter} className="flex items-center border-b border-[#f5eddc]/35 pb-3" data-testid="form-newsletter"><label htmlFor="email" className="sr-only">Email address</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your@email.com" required className="min-w-0 flex-1 bg-transparent text-sm text-[#f5eddc] outline-none placeholder:text-[#f5eddc]/45" data-testid="input-newsletter-email" /><button type="submit" className="focus-ring flex items-center gap-2 text-sm text-[#d7a35f]" data-testid="button-newsletter-submit">Join <ArrowUpRight size={15} /></button></form>}</div></div>
        </section>
      </main>

      <footer className="bg-[#28392b] px-5 py-10 text-[#f5eddc] md:px-10 md:py-14">
        <div className="mx-auto max-w-[1440px]"><div className="flex flex-col justify-between gap-10 md:flex-row"><div><a href="#top" className="focus-ring inline-flex items-center gap-2" data-testid="link-footer-brand"><span className="display text-3xl">NŌR</span><span className="mt-1 text-[10px] tracking-[.2em] text-[#d7a35f]">/ SHEA</span></a><p className="mt-5 max-w-[230px] text-sm leading-[1.6] text-[#f5eddc]/55">Body care for staying in the moment. Made in small batches, from the source outward.</p></div><div className="grid grid-cols-2 gap-x-14 gap-y-4 text-sm md:grid-cols-3 md:gap-x-20"><div className="grid gap-3"><span className="eyebrow text-[#d7a35f]">Explore</span><a href="#story" className="focus-ring text-[#f5eddc]/65 hover:text-[#f5eddc]" data-testid="link-footer-story">Our story</a><a href="#ritual" className="focus-ring text-[#f5eddc]/65 hover:text-[#f5eddc]" data-testid="link-footer-ritual">The ritual</a><a href="#ingredients" className="focus-ring text-[#f5eddc]/65 hover:text-[#f5eddc]" data-testid="link-footer-formula">The formula</a></div><div className="grid gap-3"><span className="eyebrow text-[#d7a35f]">Say hello</span><a href="mailto:hello@norshea.example" className="focus-ring text-[#f5eddc]/65 hover:text-[#f5eddc]" data-testid="link-footer-email">Email us</a><a href="#journal" className="focus-ring text-[#f5eddc]/65 hover:text-[#f5eddc]" data-testid="link-footer-journal">Field notes</a><a href="#top" className="focus-ring flex items-center gap-2 text-[#f5eddc]/65 hover:text-[#f5eddc]" data-testid="link-footer-instagram"><Instagram size={14} /> Instagram</a></div><div className="col-span-2 grid gap-3 md:col-span-1"><span className="eyebrow text-[#d7a35f]">Made with care</span><span className="text-sm text-[#f5eddc]/65">Accra / Ghana<br />For skin / For keeps</span></div></div></div><div className="mt-16 flex flex-col justify-between gap-3 border-t border-[#f5eddc]/15 pt-5 text-[10px] tracking-[.12em] text-[#f5eddc]/40 md:flex-row"><span>© 2025 NŌR / shea</span><span>uncomplicated care for complicated days</span></div></div>
      </footer>
    </div>
  );
}

function ProductPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'The Butterscotch Jar — SiriSoufflé';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="grain min-h-[100dvh] bg-[#f5eddc] text-[#394a35]">
      <header className="relative z-30">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 md:px-10 md:py-7">
          <Link href="/" className="focus-ring flex items-center gap-2" data-testid="link-product-brand">
            <span className="display text-[26px] leading-none tracking-[-.06em]">NŌR</span>
            <span className="mt-1 text-[10px] font-medium tracking-[.2em] text-[#d7a35f]">/ SHEA</span>
          </Link>
          <Link
            href="/"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-[#394a35]/25 px-4 py-2.5 text-[#394a35] transition hover:bg-[#394a35] hover:text-[#f5eddc]"
            data-testid="link-product-back"
          >
            <ArrowUpRight size={15} className="rotate-[270deg]" />
            <span className="eyebrow !text-[9px]">back to the story</span>
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-[1440px] px-5 pb-6 pt-16 md:px-10 md:pb-10 md:pt-24">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="eyebrow flex items-center gap-3 text-[#52634b]/75">
                <span>the product, up close</span>
                <span className="h-px w-10 bg-[#52634b]/50" />
                <span>01 / 01</span>
              </div>
              <h1 className="display mt-6 max-w-[830px] text-[clamp(4.3rem,11vw,10rem)] leading-[.78]">
                Meet the
                <br />
                <em className="text-[#c87046]">butterscotch.</em>
              </h1>
            </div>
            <p className="max-w-[260px] pb-1 text-sm leading-[1.7] text-[#52634b]/75 md:text-right">
              One jar, seen from every angle. Scroll slowly to move from front label to whipped top.
            </p>
          </div>
        </section>

        <ScrollProductViewer frames={productFrames} label="scroll to turn the jar" />

        <section className="border-t border-[#394a35]/15 bg-[#e2cfab] px-5 py-20 md:px-10 md:py-28">
          <div className="mx-auto grid max-w-[1180px] gap-12 md:grid-cols-[.8fr_1.2fr] md:items-end">
            <div>
              <span className="eyebrow text-[#52634b]/75">the daily butter</span>
              <h2 className="display mt-6 max-w-[600px] text-[clamp(3.5rem,7vw,7rem)] leading-[.82]">
                Warm skin.
                <br />
                <em className="text-[#c87046]">Slow hands.</em>
              </h2>
            </div>
            <div className="grid gap-6 text-sm leading-[1.7] text-[#52634b]/80 md:grid-cols-2">
              <p>Whipped shea with a soft butterscotch finish. Made to melt between your palms and disappear into damp skin.</p>
              <p>120g of uncomplicated care, prepared in small batches and kept close for whenever your body asks for more.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#394a35] px-5 py-16 text-[#f5eddc] md:px-10 md:py-20">
          <div className="mx-auto flex max-w-[1180px] flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <span className="eyebrow text-[#d7a35f]">siri soufflé · butterscotch</span>
              <p className="display mt-3 text-4xl">Keep this ritual close.</p>
            </div>
            <Link
              href="/"
              className="button-sheen focus-ring inline-flex w-fit items-center gap-3 rounded-full bg-[#d7a35f] px-6 py-3.5 text-sm font-semibold text-[#394a35] transition hover:-translate-y-1"
              data-testid="link-product-shop"
            >
              Return to NŌR <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/product" component={ProductPage} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;