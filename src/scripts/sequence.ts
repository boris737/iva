/** Frame sequence on canvas, drawn with object-fit: cover math.
 *  Crossfades between neighbouring frames so a short sequence still scrubs smoothly.
 *  Frame 0 is drawn first and matches the static <img>, so the swap is invisible. */
export async function frameSequence(canvas: HTMLCanvasElement, base: string, count: number) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return null;
  const load = (i: number) => new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image(); im.decoding = 'async';
    im.onload = () => im.decode().then(() => res(im), () => res(im)); im.onerror = rej;
    im.src = `${base}${String(i).padStart(2, '0')}.webp`;
  });
  const frames: (HTMLImageElement | undefined)[] = new Array(count);
  try { frames[0] = await load(0); } catch { return null; }
  // load the rest in order, without blocking
  (async () => { for (let i = 1; i < count; i++) { try { frames[i] = await load(i); } catch {} } })();

  const size = () => {
    const r = canvas.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
  };
  const blit = (im: HTMLImageElement, alpha: number) => {
    const cw = canvas.width, ch = canvas.height, s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.globalAlpha = alpha; ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
  };
  const nearest = (i: number, dir: number) => { while (i >= 0 && i < count && !frames[i]) i += dir; return frames[Math.max(0, Math.min(count - 1, i))] ?? frames[0]!; };
  let last = 0;
  const draw = (p: number) => {
    last = p;
    const f = Math.max(0, Math.min(1, p)) * (count - 1), i = Math.floor(f), t = f - i;
    blit(nearest(i, -1), 1);
    if (t > 0.01 && i + 1 < count && frames[i + 1]) blit(frames[i + 1]!, t);
    ctx.globalAlpha = 1;
  };
  size(); draw(0);
  new ResizeObserver(() => { size(); draw(last); }).observe(canvas);
  return { draw };
}
