// Home choreography. One file so ScrollTriggers are created in page order.
import { gsap, ScrollTrigger, initScroll } from './scroll';
import { frameSequence } from './sequence';

const mob = () => innerWidth < 760;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

export function initHome() {
  initScroll();
  hero(); approach(); peak(); iva(); hand(); rigour(); touch(); close();
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

/* 2 · Approach: scroll drives the camera down to her entrance (60 frames from a Higgsfield move of her
   render), the words change as you get closer, then the two glass leaves slide apart onto the travertine
   of the next act, so the 3D plan reads as what is behind the door. */
const ROOT = () => ((window as any).__root as string) || '/';
function approach() {
  const el = document.querySelector<HTMLElement>('[data-approach]'); if (!el) return;
  el.classList.add('live');
  const q = (s: string) => el.querySelector<HTMLElement>(s)!;
  const set = mob() ? 'm' : 'd';
  const doors = [q('.ap-l'), q('.ap-r')];
  doors.forEach((d) => (d.style.backgroundImage = `url(${ROOT()}seq/door/${set}/59.webp)`));
  const lines = [q('.ap-copy .display'), q('.ap-1'), q('.ap-2'), q('.ap-3')];
  const win = [[0.0, 0.2], [0.2, 0.42], [0.44, 0.64], [0.66, 0.8]];
  const cl = gsap.utils.clamp(0, 1);
  const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  let seq: { draw: (p: number) => void } | null = null;
  const P = 0.8;                                        // the camera owns 0–.8, the doors the rest
  const update = (p: number) => {
    seq?.draw(Math.min(1, p / P));
    const open = inOut(cl((p - 0.82) / 0.18));
    const show = p >= P - 0.005;
    doors.forEach((d, i) => {
      d.style.visibility = show ? 'visible' : 'hidden';
      d.style.transform = `translate3d(${(i ? 1 : -1) * open * 52}%,0,0) scale(${1 + open * 0.06})`;
      d.style.setProperty('--edge', String(Math.min(1, open * 6) * (1 - open)));
    });
    q('.ap-seq').style.opacity = show ? '0' : '1';
    lines.forEach((l, i) => {
      const [a, b] = win[i];
      const o = cl(Math.min((p - a) / 0.05, (b - p) / 0.05));
      l.style.opacity = String(i === 0 ? cl((b - p) / 0.05) : o);
      l.style.transform = `translate3d(0,${((1 - o) * 18).toFixed(1)}px,0)`;
    });
    q('.ap-note').style.opacity = String(cl(1 - open * 2));
  };
  const st = { p: 0 };
  gsap.to(st, { p: 1, ease: 'none', onUpdate: () => update(st.p), scrollTrigger: {
    trigger: el, start: 'top top', end: () => '+=' + Math.round(innerHeight * (mob() ? 3 : 3.6)),
    pin: q('.ap-stage'), scrub: 0.5, invalidateOnRefresh: true,
  } });
  update(0);
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return; io.disconnect();
    seq = await frameSequence(q('.ap-seq') as HTMLCanvasElement, `${ROOT()}seq/door/${set}/`, 60);
    update(st.p);
  }, { rootMargin: '200% 0px' });
  io.observe(el);
}

/* 3 · Peak: plan → massing → render, the longest held scroll on the page */
function peak() {
  const el = document.querySelector<HTMLElement>('[data-peak]'); if (!el) return;
  const gl = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
  if (!gl) return;
  el.classList.add('live');
  const q = (s: string) => el.querySelector<HTMLElement>(s)!;
  const lines = [...el.querySelectorAll<HTMLElement>('.peak-lines li')];
  const st = { p: 0 };
  let three: { draw: (p: number) => void } | null = null;
  const P3 = 0.86; // the model assembles over most of the act, then holds for the title
  const update = () => {
    const p = st.p;
    three?.draw(Math.min(1, p / P3));
    lines.forEach((li, i) => {
      const a = [0.02, 0.28, 0.56][i], b = [0.25, 0.53, 0.84][i];
      const o = gsap.utils.clamp(0, 1, Math.min((p - a) / 0.04, (b - p) / 0.04));
      li.style.opacity = String(o); li.style.transform = `translateY(${(1 - o) * 14}px)`;
    });
    q('.peak-title').style.opacity = String(gsap.utils.clamp(0, 1, (p - 0.86) / 0.06));
  };
  gsap.to(st, { p: 1, ease: 'none', onUpdate: update, scrollTrigger: { trigger: el, start: 'top top', end: () => '+=' + Math.round(innerHeight * (mob() ? 2.6 : 3)), pin: q('.peak-stage'), scrub: 0.6, invalidateOnRefresh: true } });
  update();
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return; io.disconnect();
    const [{ mountPeak }] = await Promise.all([import('./peak3d')]);
    three = await mountPeak(q('.peak-3d') as HTMLCanvasElement, el.dataset.plan!);
    update();
  }, { rootMargin: '150% 0px' });
  io.observe(el);
}

/* 3b · Iva: her mark drifts slower than the page; the portrait opens from the bottom like a print sliding out */
function iva() {
  const el = document.querySelector<HTMLElement>('[data-iva]'); if (!el) return;
  gsap.fromTo(el.querySelector('.iva-mark'), { yPercent: -38 }, { yPercent: -62, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 20%', scrub: 0.5 } })
    .fromTo(el.querySelector('.iva-photo'), { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', ease: 'power2.out' }, 0)
    .fromTo(el.querySelector('.iva-photo img'), { scale: 1.12 }, { scale: 1, ease: 'power2.out' }, 0)
    .from(el.querySelectorAll('.iva-copy > *'), { y: 26, opacity: 0, stagger: 0.06, ease: 'power2.out' }, 0.15);
}

/* 4 · Hand: the track travels sideways while the frame holds */
function hand() {
  const el = document.querySelector<HTMLElement>('[data-hand]'); if (!el) return;
  el.classList.add('live');
  const track = el.querySelector<HTMLElement>('.hand-track')!;
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: () => '+=' + dist() * (mob() ? 0.8 : 0.62), pin: el.querySelector('.hand-stage'), scrub: 0.5, invalidateOnRefresh: true } });
}

/* 5 · Rigour: a drafting table. Each sheet lands as her drawing, a plotter line prints her render
   over it from the top, then the next sheet lands on the pile. One pin, three projects. */
function rigour() {
  const el = document.querySelector<HTMLElement>('[data-rigour]'); if (!el) return;
  el.classList.add('live');
  const rows = [...el.querySelectorAll<HTMLElement>('[data-rg]')].map((rg, i) => ({
    rg, text: rg.querySelector<HTMLElement>('.rg-text')!, sheet: rg.querySelector<HTMLElement>('.rg-sheet')!,
    photo: rg.querySelector<HTMLElement>('.rg-photo')!, scan: rg.querySelector<HTMLElement>('.rg-scan')!,
    shade: rg.querySelector<HTMLElement>('.rg-shade')!, rest: [-0.7, 0.9, -0.35][i] ?? 0,
  }));
  const n = rows.length, cl = gsap.utils.clamp(0, 1);
  const outExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const tilt = { x: 0, y: 0 };
  let on = -1;
  const update = (p: number) => {
    const vh = innerHeight;
    rows.forEach((r, i) => {
      const t = p * n - i;                               // local time: <0 waiting, 0..1 own, >1 buried
      const land = outExpo(cl(t / 0.2));                 // sheet slides onto the table
      const plot = inOut(cl((t - 0.3) / 0.42));          // plotter prints the render top → bottom
      const bury = cl(t - 1) ;                           // later sheets cover it
      const y = (1 - land) * vh * 1.15 - bury * 18;
      const rot = (1 - land) * 4 + r.rest;
      const sc = 1 - Math.min(bury, 2) * 0.025;
      r.sheet.style.transform = `perspective(1400px) translate3d(0,${y.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(4)}) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`;
      r.photo.style.clipPath = `inset(0 0 ${((1 - plot) * 100).toFixed(2)}% 0)`;
      r.scan.style.opacity = String(plot > 0 && plot < 1 ? 1 : 0);
      r.scan.style.transform = `translateY(${(plot * r.sheet.offsetHeight).toFixed(1)}px)`;
      r.shade.style.opacity = String(Math.min(0.55, bury * 0.45));
      const last = i === n - 1;
      const o = cl(Math.min((t - 0.06) / 0.14, last ? 1 : (0.98 - t) / 0.08));
      r.text.style.opacity = String(o);
      r.text.style.transform = `translate3d(0,${((1 - o) * (t < 0.5 ? 24 : -16)).toFixed(1)}px,0)`;
    });
    const cur = Math.min(n - 1, Math.floor(p * n * 0.9999));
    if (cur !== on) { on = cur; rows.forEach((r, i) => { r.rg.classList.toggle('on', i === cur); r.text.inert = i !== cur; }); }
  };
  const st = { p: 0 };
  gsap.to(st, { p: 1, ease: 'none', onUpdate: () => update(st.p), scrollTrigger: {
    trigger: el, start: 'top top', end: () => '+=' + Math.round(innerHeight * (mob() ? 2.7 : 3.1)),
    pin: el.querySelector('.rg-stage'), scrub: 0.6, invalidateOnRefresh: true,
  } });
  update(0);
  if (fine) {   // the top sheet leans a little towards the pointer, like paper you could lift
    const tx = gsap.quickTo(tilt, 'x', { duration: 0.8, ease: 'power3', onUpdate: () => update(st.p) });
    const ty = gsap.quickTo(tilt, 'y', { duration: 0.8, ease: 'power3' });
    el.addEventListener('pointermove', (e) => { tx((e.clientX / innerWidth - 0.5) * 3); ty(-(e.clientY / innerHeight - 0.5) * 3); });
    el.addEventListener('pointerleave', () => { tx(0); ty(0); });
  }
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
