# Handoff: Iva Hristova portfolio website

This hands the project from a Claude Code cloud session to **Claude Cowork**.
Everything the next Claude needs is in this file and in the GitHub repo.

---

## 1. Prompt to paste into Cowork

> You're taking over the portfolio website for **Iva Hristova**, an architect and interior designer in Skopje. I'm **Boris**, her brother: I run the project and she approves the result.
>
> Before doing anything, read these three things:
> 1. **`HANDOFF.md`** at the root of the GitHub repo **https://github.com/boris737/iva** (public). It has the full context: decisions, rules, file map, what's done and what's next.
> 2. **`LOOP.md`** and **`content/inventory.md`** in the same repo.
> 3. My Google Drive folders **"iva web sajt"** (her files) and **"iva 2 inspiration desines"** (25 reference images she likes; reference only, never publish them).
>
> **Goal:** make this the best possible architecture portfolio. Premium, memorable scroll effects, 3D, and Higgsfield media, at the level of the "scroll-craft" style (Nate's skill). My verdict on version 1 was "basic", so don't play it safe. Her real work must always be the hero.
>
> **Hard rules:**
> - Never present generated images or video as her work. No generated buildings or rooms. Generated media may only animate her own renders (camera and light), make empty plates or atmosphere, or show material samples, and must say so in a small caption.
> - Never invent facts: years, areas, her role, or clients.
> - Never put API keys in code, chat or git.
> - Fast on mobile (LCP under 2.5 s), works on phones, respects reduced motion.
> - Copy is short and human. No AI clichés, no em dashes.
>
> **How I work:** I'm direct and short; be the same. Show screenshots, don't describe. Ask your best questions in one batch. Commit and push to `main` after every meaningful change.
>
> **Start by:**
> 1. Cloning the repo and running it (`npm install`, `npm run build`, `npx astro preview`).
> 2. Screenshotting the home page at 390 px and 1440 px.
> 3. Telling me in five lines what you'd change first. Then do it.

---

## 2. The project in one screen

| | |
|---|---|
| Person | Iva Hristova (Ива Христова: Cyrillic spelling still needs Iva's confirmation) |
| Role | Architect and interior designer, Skopje, North Macedonia |
| Studio | **Hristdesign** (her own interiors studio). Currently also an interior designer at Parallel Group, Skopje |
| Contact | hristovaiva1@gmail.com · +389 75 425 144 · Instagram @hristdesign |
| Audience | **Both, studios first**: international architecture studios (jobs), then local clients for Hristdesign |
| Language | **English + Macedonian** (`/` and `/mk/`). The Macedonian copy is a Claude draft that Iva hasn't reviewed |
| Hosting | **Vercel**, free subdomain for now (not deployed yet; Boris has to import the repo at vercel.com/new) |
| Repo | https://github.com/boris737/iva (public, branch `main`) |
| Brand | Her name leads. Hristdesign is a sub-section. Two logos are in `source/logos/` |
| Stack | Astro 5, GSAP + ScrollTrigger, Lenis, Three.js; fonts Montserrat (display), Literata (serif), Golos Text (body). All support Cyrillic |

## 3. Her work (all conceptual, none built)

| Project | Year | Where | Best assets |
|---|---|---|---|
| **Aura Theatre** | ? | Aerodrom, Skopje | Sunset aerial render (the hero), red-line axonometry, floor plans, massing study, roof detail |
| **Quiet Sailing**: museum, marina, fish market | 2025–26, **university studio** (Urban Design 1) | Lake Ohrid | Hand sketches, boat watercolours, lakeside renders |
| **XMall**: mixed use | 2026 | Aerodrom, Skopje | Aerial, tower render, red axonometry. Site 24,500 m², GBA 32,800 m² |
| **Health Center** | ? | Skopje | Aerial with the curved perforated wall, plans. Site 6,500 m² |
| **Public Building** | ? | Skopje | Black-and-white sections and elevations, glass towers |

**Known gaps** (never fill these by guessing):
- The years for Aura, Health Center and Public Building.
- Her role on each project.
- Aura's real areas: her spread repeats XMall's numbers.
- Name conflicts: "Vitalis Medical Center" vs "Health Center", and "Axis" vs "Public Building".
- **No interior work** in the files, even though her CV lists it.
- **No full-resolution renders.** Every image is cut from photos of her printed book, about 600–850 px wide. Never show one above 1.6× its native size.
- The "IVA LOGO" reads as "IVY".

## 4. What's built (commit `b80648a`)

**Home page** (`src/views/Home.astro` + `src/scripts/home.ts`): seven acts, each using a different effect.
1. **Arrival.** Her Aura render cut into planes (generated empty-park plate, her building, foreground trees), with IVA HRISTOVA *between* the land and her building. Scroll and pointer parallax.
2. **Voice.** Her own sentence from her portfolio lights up word by word (pinned).
3. **Peak, the signature move.** Her real ground-floor plan lies flat in WebGL, the massing rises out of it in her red line (`src/scripts/peak3d.ts`), then her render opens in a circle reveal with a Higgsfield motion study of it (25-frame WebP sequence on canvas, `public/seq/aura/`). This is the longest pin.
4. **Hand.** Quiet Sailing as a horizontal pan, sketches as large as the renders.
5. **Rigour.** XMall, Health Center and Public Building, each revealed by a clip wipe from a different direction.
6. **Touch.** Hristdesign on walnut; a warm lamp follows the pointer over the material samples.
7. **Close.** The same park at night (generated plate) with her building still lit, her real signature (traced from her portfolio cover, `src/assets/signature.svg`) writing itself out, and contact details.

**Other pages:**
- `/work/`.
- Five project pages (`src/views/Project.astro`): a "focus frame" hero (a sharp window travels across a blurred render), facts, text, a gallery, and the 3D massing on the Aura page.
- `/about/` with a CV download.
- `/contact/`.
- All of the above also under `/mk/`.

**Old version:** the v1 home is kept as `src/views/HomeV1.astro`.

**Checked:**
- Lighthouse accessibility, best practices and SEO all at 100.
- Mobile LCP about 1.5–1.9 s under real throttling. CLS under 0.03.
- No console errors.
- Reduced motion gets static versions.

**Not checked:** a real phone, and the 3D on a real GPU.

## 5. Next steps (in order)

1. **Get Boris's reaction to v2** on a real screen, ideally after deploying to Vercel.
2. The 3D building in the peak is too small on phones: zoom in when `aspect < 1` in `peak3d.ts`.
3. The mid-peak background is a muddy grey: tune the colour interpolation in `home.ts → peak()`.
4. Bring the project pages up to the home page's level: layered heroes for Quiet Sailing and Health Center (same plate-and-matte method, section 6), and drawings that draw themselves in.
5. More Higgsfield motion from her renders: Quiet Sailing lakeside, Health Center.
6. A material-wipe transition between dark and light sections (reference image 24, reeded glass).
7. Deploy to Vercel. Ask Iva for full-resolution renders, her interior work, the missing facts, and a review of the Macedonian copy.

## 6. Higgsfield (generated media)

- **Spent: $0.585 of the $4 cap.** Boris said "use it all if needed". Still log every job.
- **Script:** `scripts/hf.mjs`. It gets a price quote first, enforces the cap from `assets/generated/spend-log.csv`, uploads local images, submits with an Idempotency-Key, polls, downloads and logs.
  ```bash
  node scripts/hf.mjs estimate <endpoint> '<json>'
  node scripts/hf.mjs run <endpoint> '<json>' --image her-render.png --name slug [--yes]
  node scripts/hf.mjs run alibaba/qwen-image-3/edit '<json>' --refs a.png --name slug
  node scripts/hf.mjs spend
  ```
- **Credentials:** the key Boris gave was stored in the *cloud environment's proxy*, not in a file, so **it doesn't come with the repo.** In Cowork, either:
  - put `HF_API_KEY_ID` and `HF_API_KEY_SECRET` in a local `.env` (git-ignored, never committed), or
  - use the Higgsfield connector if Cowork has one.
- **Models that worked:**
  - `kling-video/v2.5-turbo/pro/image-to-video`: about $0.26 per 5 s; good for animating her renders.
  - `alibaba/qwen-image-3/edit`: about $0.075 per image at 2k; clean plates and segmentation mattes. Its output is 4:3, so centre-crop back to the original's aspect ratio (`W/1.382`, scale about 1.005, then +3 px y-offset). Then cut the layers from *her original pixels* using the mattes.
  - `higgsfield-ai/soul/v2/standard`: $0.004–0.006 per image; textures and tests.
- **Docs:** https://docs.higgsfield.ai/docs/llms.txt (the root `/llms.txt` returns 404).
- **Rule:** generated = atmosphere only. Check every frame of a video for the building changing shape before using it.

## 7. File map

```
HANDOFF.md              this file
LOOP.md                 improvement-loop rules + checklist (13 items)
loop/scores.md          scores per round + log
content/inventory.md    every fact about her, the projects, and the gaps
content/inspiration.md  what her 25 reference images say (images are NOT in git)
scrollcraft/builds/iva/BRIEF.md   journey, feeling curve, peak for the home page
source/                 her original files (portfolio spreads, CV, logos)
scripts/crops.py        cuts her renders and drawings out of the spreads (47 crops)
scripts/hf.mjs          Higgsfield pipeline
scripts/shoot.mjs       screenshots of every page at 390 and 1440
scripts/strip.mjs       scroll-strip frames of a page
src/data/projects.ts    all project copy, EN + MK
src/data/site.ts        site copy, CV, contact
src/views/*.astro       pages;  src/components/*.astro  effects
src/scripts/*.ts        GSAP/Three choreography
src/assets/hero/        layer plates and cutouts
public/seq/aura/        motion-study frames (d = desktop, m = mobile)
```

## 8. Run it

```bash
git clone https://github.com/boris737/iva && cd iva
npm install
npm run build && npx astro preview --port 4321
node scripts/strip.mjs loop/shots/check 1440 900 0.5   # needs playwright
```
