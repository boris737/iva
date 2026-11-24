// Walk the home page in viewport steps and save a frame at each; prints console errors.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [out = 'loop/shots/strip', W = '1440', H = '900', step = '0.5', path = '/'] = process.argv.slice(2);
const fs = require('fs'); fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const w = +W, h = +H, mobile = w < 700;
const c = await b.newContext({ viewport: { width: w, height: h }, ...(mobile ? { isMobile: true, hasTouch: true } : {}) });
const p = await c.newPage(); const errs = [];
p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://localhost:4321' + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
const total = await p.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = 0; y < total - h * 0.5; y += h * +step) {
  await p.evaluate((y) => scrollTo(0, y), Math.round(y)); await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/${String(i++).padStart(3, '0')}.jpg`, quality: 70 });
}
console.log(i, 'frames, page height', total, 'errors', errs);
await b.close();
