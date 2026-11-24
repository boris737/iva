import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let started = false;
export let lenis: Lenis | null = null;

/** Lenis smooth scroll driven by GSAP's ticker, so ScrollTrigger and Lenis share one frame loop.
 *  Skipped for reduced motion and for touch devices, where native scroll already feels right. */
export function initScroll() {
  if (started) return;
  started = true;
  if (reduced() || matchMedia('(pointer: coarse)').matches) return;
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
  const l = lenis;
  l.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => l.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!a || a.origin !== location.origin || a.pathname !== location.pathname) return;
    const el = document.querySelector(a.hash);
    if (el) { e.preventDefault(); l.scrollTo(el as HTMLElement, { offset: -20 }); }
  });
}

export { gsap, ScrollTrigger };
