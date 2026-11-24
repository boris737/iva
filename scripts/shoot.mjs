// Screenshot every page at 390 and 1440, plus mid-scroll states of the "Lights on" section.
// Usage: node scripts/shoot.mjs <outDir> [baseUrl]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const out = process.argv[2] || 'loop/shots/latest';
const base = process.argv[3] || 'http://localhost:4321';
const pages = ['/', '/work/', '/work/aura-theatre/', '/work/quiet-sailing/', '/work/xmall/', '/work/health-center/', '/work/public-building/', '/about/', '/contact/', '/mk/'];
const sizes = [[390, 844, 'm'], [1440, 900, 'd']];
const fs = require('fs'); fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [w, h, tag] of sizes) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, ...(tag === 'm' ? { isMobile: true, hasTouch: true } : {}) });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  for (const path of pages) {
    await p.goto(base + path, { waitUntil: 'networkidle' });
    await p.evaluate(async () => { await document.fonts.ready; for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); await new Promise((r) => setTimeout(r, 400)); });
    const name = (path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-'));
    await p.screenshot({ path: `${out}/${name}-${tag}.png`, fullPage: true });
    await p.screenshot({ path: `${out}/${name}-${tag}-fold.png` });
  }
  // signature moment
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(() => { const st = window.__lo; const el = document.querySelector('[data-lo]'); const top = el.getBoundingClientRect().top + scrollY; return { top, len: innerHeight * (innerWidth < 760 ? 1.8 : 2.4) }; });
  for (const f of [0.1, 0.38, 0.6, 0.97]) {
    await p.evaluate((y) => scrollTo(0, y), r.top + r.len * f);
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${out}/lights-${Math.round(f * 100)}-${tag}.png` });
  }
  if (errs.length) console.log(tag, 'ERRORS:', errs);
  await ctx.close();
}
await b.close();
console.log('done ->', out);
