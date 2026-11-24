#!/usr/bin/env node
// Higgsfield pipeline: estimate → budget check → (upload) → submit → poll → download → log.
//
//   node scripts/hf.mjs estimate <endpoint> '<json>'
//   node scripts/hf.mjs run <endpoint> '<json>' [--image path/to/local.jpg] [--name slug] [--yes]
//   node scripts/hf.mjs resume            # finish jobs left in pending.json
//   node scripts/hf.mjs spend             # total spent vs cap
//
// <endpoint> is a model endpoint ID from docs.higgsfield.ai, e.g.
//   higgsfield-ai/soul/v2/standard
//   kling-video/v2.5-turbo/standard/image-to-video
// --image uploads a local file and passes its URL as `image_url`.
// --refs a.png,b.png uploads files and passes them as `image_urls` (edit models).
//
// Budget: the spend log plus pending jobs plus this job must stay <= CAP_USD.
// Any job estimated above ASK_USD needs --yes (only after Boris has OK'd the price).
// Cost logged = Higgsfield's /estimate figure (the status response carries no cost).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

// Node's fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY=1 (Node >= 22.21): re-exec once.
if (process.env.HTTPS_PROXY && !process.env.NODE_USE_ENV_PROXY) {
  const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
  process.exit(r.status ?? 1);
}

const API = 'https://api.higgsfield.ai';
const CAP_USD = 4.9; // Boris: "use up all the Higgsfield credit" ($5 balance)
const ASK_USD = 0.3;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'assets/generated');
const LOG = path.join(OUT, 'spend-log.csv');
const PENDING = path.join(OUT, 'pending.json');
const HEADER = 'date,model,prompt,seconds_or_images,cost_usd,status,request_id,file\n';

// ---- credentials: .env → process.env; otherwise rely on the network proxy injecting them
function loadEnv() {
  const f = path.join(ROOT, '.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
loadEnv();
const { HF_API_KEY_ID: KID, HF_API_KEY_SECRET: KSEC } = process.env;
// Placeholder when keys live in the proxy, which replaces this header. Never printed.
const AUTH = `Key ${KID || 'proxy'}:${KSEC || 'proxy'}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const die = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };

async function api(method, url, body, extra = {}) {
  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(url.startsWith('http') ? url : API + url, {
        method,
        headers: { Authorization: AUTH, 'Content-Type': 'application/json', ...extra },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      if (attempt < 4) { await sleep(2000 * 2 ** attempt); continue; }
      throw e;
    }
    if (res.status >= 500 && attempt < 4) { await sleep(2000 * 2 ** attempt); continue; }
    const text = await res.text();
    if (!res.ok) die(`${method} ${url} → ${res.status} ${text.slice(0, 400)}`);
    return text ? JSON.parse(text) : {};
  }
}

// ---- spend log
function readLog() {
  if (!fs.existsSync(LOG)) return [];
  const rows = fs.readFileSync(LOG, 'utf8').trim().split('\n').slice(1);
  return rows.map((r) => {
    const cells = r.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, ''));
    return { cost: parseFloat(cells[4]) || 0, status: cells[5] };
  });
}
const spent = () => readLog().reduce((s, r) => s + r.cost, 0);
const readPending = () => (fs.existsSync(PENDING) ? JSON.parse(fs.readFileSync(PENDING, 'utf8')) : []);
const writePending = (p) => fs.writeFileSync(PENDING, JSON.stringify(p, null, 2));
const reserved = () => readPending().reduce((s, j) => s + j.cost, 0);
const csv = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function logJob(j, status, cost, file) {
  fs.mkdirSync(OUT, { recursive: true });
  if (!fs.existsSync(LOG)) fs.writeFileSync(LOG, HEADER);
  const units = j.params.duration ? `${j.params.duration}s` : `${j.params.batch_size || 1} img`;
  fs.appendFileSync(LOG, [new Date().toISOString(), j.endpoint, csv(j.params.prompt), units,
    cost.toFixed(4), status, j.request_id, csv(file)].join(',') + '\n');
}

// ---- steps
async function estimate(endpoint, params) {
  const r = await api('POST', `/estimate/${endpoint}`, params);
  let usd = parseFloat(r.usd);
  if (!Number.isFinite(usd) && r.type === 'description') {
    // e.g. "rates in USD per video second: 720p: $0.0315; 1080p: $0.0525"
    const text = r.pricing_description || '';
    const rates = [...text.matchAll(/(\d{3,4}p)\s*:\s*\$([\d.]+)/g)].map((m) => ({ res: m[1], usd: parseFloat(m[2]) }));
    const chosen = rates.find((x) => x.res === params.resolution) || rates.sort((a, b) => b.usd - a.usd)[0];
    if (chosen && /per video second/i.test(text)) usd = chosen.usd * (params.duration || 5); // highest rate when unsure
  }
  if (!Number.isFinite(usd)) die(`no usd in estimate: ${JSON.stringify(r)}`);
  return usd;
}

async function upload(file) {
  const ext = path.extname(file).slice(1).toLowerCase();
  const type = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', mp4: 'video/mp4' }[ext];
  if (!type) die(`unsupported upload type: ${ext}`);
  const u = await api('POST', '/files/generate-upload-url', { content_type: type });
  // presigned storage URL: no Higgsfield credentials
  const put = await fetch(u.upload_url, { method: 'PUT', headers: u.upload_headers, body: fs.readFileSync(file) });
  if (!put.ok) die(`upload failed: ${put.status}`);
  return u.public_url;
}

async function finish(j) {
  let delay = 2000;
  const t0 = Date.now();
  let s;
  for (;;) {
    s = await api('GET', j.status_url);
    if (['completed', 'failed', 'nsfw', 'canceled'].includes(s.status)) break;
    if (Date.now() - t0 > 20 * 60e3) die(`timeout; request ${j.request_id} still ${s.status}. Run "resume" later.`);
    process.stdout.write(`  ${s.status}…\r`);
    await sleep(delay + Math.random() * 500);
    delay = Math.min(delay * 1.5, 10000);
  }
  const files = [];
  if (s.status === 'completed') {
    const urls = [...(s.images || []).map((i) => i.url), s.video?.url].filter(Boolean);
    for (const [i, url] of urls.entries()) {
      const ext = path.extname(new URL(url).pathname) || (s.video ? '.mp4' : '.png');
      const name = `${j.name}-${j.request_id.slice(0, 8)}${urls.length > 1 ? `-${i + 1}` : ''}${ext}`;
      const res = await fetch(url);
      if (!res.ok) die(`download ${res.status} for ${url} (request ${j.request_id}); run "resume" after fixing`);
      fs.writeFileSync(path.join(OUT, name), Buffer.from(await res.arrayBuffer()));
      files.push(`assets/generated/${name}`);
    }
  }
  // failed / nsfw / canceled are not charged
  const cost = s.status === 'completed' ? j.cost : 0;
  logJob(j, s.status, cost, files.join(' '));
  writePending(readPending().filter((p) => p.request_id !== j.request_id));
  console.log(`✓ ${s.status}  $${cost.toFixed(3)}  ${files.join(' ') || s.error || ''}`);
  console.log(`  total spent $${spent().toFixed(3)} / $${CAP_USD}`);
}

async function run(endpoint, params, { image, refs, name, yes }) {
  if (!params.prompt) die('params.prompt is required');
  const ph = 'https://example.com/placeholder.jpg';
  const usd = await estimate(endpoint, { ...params, ...(image ? { image_url: ph } : {}), ...(refs ? { image_urls: refs.map(() => ph) } : {}) });
  const committed = spent() + reserved();
  console.log(`estimate $${usd.toFixed(3)} · spent+pending $${committed.toFixed(3)} · cap $${CAP_USD}`);
  if (committed + usd > CAP_USD) die(`would exceed $${CAP_USD} cap. Not submitted.`);
  if (usd > ASK_USD && !yes) die(`over $${ASK_USD}: needs Boris's OK, then re-run with --yes. Not submitted.`);
  if (image) params = { ...params, image_url: await upload(image) };
  if (refs) { const urls = []; for (const r of refs) urls.push(await upload(r)); params = { ...params, image_urls: urls }; }
  const key = crypto.randomUUID();
  const r = await api('POST', `/${endpoint}`, params, { 'Idempotency-Key': key });
  const j = { endpoint, params, cost: usd, key, name: name || endpoint.split('/')[0], request_id: r.request_id, status_url: r.status_url };
  writePending([...readPending(), j]);
  console.log(`submitted ${r.request_id}`);
  await finish(j);
}

// ---- cli
const [cmd, endpoint, json, ...rest] = process.argv.slice(2);
const flag = (f) => { const i = rest.indexOf(f); return i >= 0 ? rest[i + 1] : undefined; };
const params = () => { try { return JSON.parse(json); } catch { die('second argument must be JSON params'); } };

if (cmd === 'estimate') console.log(`$${(await estimate(endpoint, params())).toFixed(4)}`);
else if (cmd === 'run') await run(endpoint, params(), { image: flag('--image'), refs: flag('--refs')?.split(','), name: flag('--name'), yes: rest.includes('--yes') });
else if (cmd === 'resume') for (const j of readPending()) await finish(j);
else if (cmd === 'spend') console.log(`spent $${spent().toFixed(3)} · pending $${reserved().toFixed(3)} · cap $${CAP_USD}`);
else die('usage: hf.mjs estimate|run|resume|spend …');
