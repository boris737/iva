/** Run after the page has loaded and the main thread is quiet, so motion code never competes with the first paint. */
export function whenIdle(fn: () => void) {
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(() => fn(), { timeout: 1500 }) : setTimeout(fn, 200));
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
}
