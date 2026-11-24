// Home choreography. One file so ScrollTriggers are created in page order.
import { gsap, ScrollTrigger, initScroll } from './scroll';
import { frameSequence } from './sequence';

const mob = () => innerWidth < 760;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

export function initHome() {
  initScroll();
  hero(); voice(); peak(); hand(); rigour(); touch(); close();
  ScrollTrigger.sort(); ScrollTrigger.refresh();
  addEventListener('load', () => ScrollTrigger.refresh());
}

/* 1 · Arrival: planes drift at different rates on scroll and lean towards the pointer */
function hero() {
  const el = document.querySelector<HTMLElement>('[data-hero]'); if (!el) return;
  const q = (s: string) => el.querySelector<HTMLElement>(s)!;
  const depth: [string, number, number][] = [['.sky', 0.06, 26], ['.land', 0.12, 14], ['.name', 0.2, 34], ['.bldg', 0.34, 6], ['.fgl', 0.6, -10]];
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.3 } })
    .to(q('.sky'), { yPercent: 26 }, 0).to(q('.land'), { yPercent: 14 }, 0)
    .to(q('.name'), { yPercent: 34, opacity: 0.15 }, 0).to(q('.bldg'), { yPercent: 6, scale: 1.04 }, 0)
    .to(q('.fgl'), { yPercent: -10, scale: 1.1 }, 0).to(q('.hero-foot'), { opacity: 0, y: -20 }, 0);
  if (!fine) return;
  const xs = depth.map(([s, k]) => [gsap.quickTo(q(s), 'x', { duration: 0.9, ease: 'power3' }), gsap.quickTo(q(s), 'y', { duration: 0.9, ease: 'power3' }), k] as const);
  el.addEventListener('pointermove', (e) => {
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    xs.forEach(([x, y, k]) => { x(-nx * 60 * k); y(-ny * 30 * k); });
  });
}

/* 2 · Voice: the sentence lights up word by word under a held frame */
function voice() {
  const el = document.querySelector<HTMLElement>('[data-voice]'); if (!el) return;
  el.classList.add('live');
  const words = el.querySelectorAll('.voice-line span');
  gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: () => '+=' + innerHeight * 0.9, pin: el.querySelector('.voice-stage'), scrub: 0.4 } })
    .to(words, { opacity: 1, stagger: 0.12, duration: 0.3, ease: 'none' })
    .from(el.querySelector('.voice-who'), { opacity: 0, y: 10, duration: 0.3 }, '>-0.2');
}

/* 3 · Peak: plan → massing → render, the longest held scroll on the page */
function peak() {
  const el = document.querySelector<HTMLElement>('[data-peak]'); if (!el) return;
  const gl = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
  if (!gl) return;
  el.classList.add('live');
  const q = (s: string) => el.querySelector<HTMLElement>(s)!;
  const lines = [...el.querySelectorAll<HTMLElement>('.peak-lines li')];
  const render = q('.peak-render');
  const st = { p: 0 };
  let three: { draw: (p: number) => void } | null = null;
  let seq: { draw: (p: number) => void } | null = null;
  const P3 = 0.62; // 3D owns 0–.62 of the act, the render owns the rest
  const update = () => {
    const p = st.p;
    three?.draw(Math.min(1, p / P3));
    seq?.draw(Math.max(0, (p - 0.66) / 0.34));
    const bg = gsap.utils.interpolate('#dad1c5', '#1c140e', gsap.utils.clamp(0, 1, (p - 0.5) / 0.07));
    el.style.background = bg;
    lines.forEach((li, i) => {
      const a = [0.02, 0.2, 0.44][i], b = [0.17, 0.4, 0.66][i];
      const o = gsap.utils.clamp(0, 1, Math.min((p - a) / 0.04, (b - p) / 0.04));
      li.style.opacity = String(o); li.style.transform = `translateY(${(1 - o) * 14}px)`;
      li.style.color = p > 0.5 ? '#f3ebdf' : '#2a2119';
    });
    const rv = gsap.utils.clamp(0, 1, (p - 0.56) / 0.12);
    render.style.opacity = String(rv > 0 ? 1 : 0);
    render.style.clipPath = `circle(${rv * 120}% at 34% 52%)`;
    q('.peak-title').style.opacity = String(gsap.utils.clamp(0, 1, (p - 0.86) / 0.06));
  };
  gsap.to(st, { p: 1, ease: 'none', onUpdate: update, scrollTrigger: { trigger: el, start: 'top top', end: () => '+=' + Math.round(innerHeight * (mob() ? 3.2 : 4.2)), pin: q('.peak-stage'), scrub: 0.6, invalidateOnRefresh: true } });
  update();
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return; io.disconnect();
    const [{ mountPeak }] = await Promise.all([import('./peak3d')]);
    three = await mountPeak(q('.peak-3d') as HTMLCanvasElement, el.dataset.plan!);
    seq = await frameSequence(q('.peak-seq') as HTMLCanvasElement, `/seq/aura/${mob() ? 'm' : 'd'}/`, 25);
    update();
  }, { rootMargin: '150% 0px' });
  io.observe(el);
}

/* 4 · Hand: the track travels sideways while the frame holds */
function hand() {
  const el = document.querySelector<HTMLElement>('[data-hand]'); if (!el) return;
  el.classList.add('live');
  const track = el.querySelector<HTMLElement>('.hand-track')!;
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: () => '+=' + dist() * (mob() ? 1 : 0.9), pin: el.querySelector('.hand-stage'), scrub: 0.5, invalidateOnRefresh: true } });
}

/* 5 · Rigour: each render opens along its own line: from the left edge, the bottom, the centre */
function rigour() {
  const from = ['inset(0 100% 0 0)', 'inset(100% 0 0 0)', 'inset(0 50% 0 50%)'];
  document.querySelectorAll<HTMLElement>('[data-rg]').forEach((el, i) => {
    const r = el.querySelector<HTMLElement>('.rg-render')!;
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 25%', scrub: 0.5 } })
      .fromTo(r, { clipPath: from[i % 3] }, { clipPath: 'inset(0 0% 0 0%)', ease: 'power2.out' }, 0)
      .from(el.querySelector('.rg-text'), { y: 40, opacity: 0, ease: 'power2.out' }, 0.2)
      .from(el.querySelector('.rg-draw'), { y: 60, opacity: 0, ease: 'power2.out' }, 0.35);
  });
}

/* 6 · Touch: a warm lamp that follows the pointer; on touch screens it drifts with scroll */
function touch() {
  const el = document.querySelector<HTMLElement>('[data-touch]'); if (!el) return;
  if (fine) {
    el.addEventListener('pointermove', (e) => { const b = el.getBoundingClientRect(); el.style.setProperty('--lx', ((e.clientX - b.left) / b.width) * 100 + '%'); el.style.setProperty('--ly', ((e.clientY - b.top) / b.height) * 100 + '%'); });
  } else {
    const s = { x: 20, y: 20 };
    gsap.to(s, { x: 80, y: 70, ease: 'none', onUpdate: () => { el.style.setProperty('--lx', s.x + '%'); el.style.setProperty('--ly', s.y + '%'); }, scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  }
  gsap.from(el.querySelectorAll('.touch-mats li'), { y: 80, opacity: 0, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 70%', end: 'top 20%', scrub: 0.5 } });
}

/* 7 · Close: night falls on the same park; her signature writes itself */
function close() {
  const el = document.querySelector<HTMLElement>('[data-close]'); if (!el) return;
  const sig = el.querySelector<HTMLElement>('.sig')!;
  gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 5%', scrub: 0.6 } })
    .fromTo(sig, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none' }, 0)
    .from(el.querySelector('.land'), { yPercent: -8, ease: 'none' }, 0)
    .from(el.querySelector('.bldg'), { yPercent: 6, ease: 'none' }, 0)
    .from(el.querySelectorAll('.close-in .display, .close-ways li'), { opacity: 0, y: 24, stagger: 0.06, ease: 'power2.out' }, 0.4);
}
