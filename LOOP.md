# Improvement loop

Goal (Boris, 2026-11-24): make Iva's site as good as it can be. Add **3D elements**, **scroll effects**,
and **Higgsfield media**. There's no rush; this runs day by day. Don't wait for check-ins: keep going and
log everything here and in `loop/scores.md`.

## Each round
1. Build, then run `node scripts/shoot.mjs loop/shots/rN` (390 and 1440, every page, plus "Lights on" at 10/38/60/97%).
2. Score each checklist item 1–10 in `loop/scores.md`.
3. Pick the **single weakest item**, or the next item on the ambition track below, and fix only that.
4. Re-shoot. Confirm it improved and nothing else broke (look at the screenshots, check console errors, run Lighthouse on any page you touched).
   Commit with a clear message and `git push`. If it got worse, `git revert`.
5. Generate Higgsfield media only when it clearly fixes the item, and only within budget.

## Hard rules
- **Never present generated content as Iva's work.** Higgsfield may animate *her own* renders (image-to-video, camera and light only,
  no new geometry) and make abstract materials or atmosphere. No generated buildings or rooms. Third-party inspiration images are never published.
- **No invented facts.** Missing data stays missing (see content/inventory.md "Gaps").
- **Budget:** $4 hard cap, enforced by `scripts/hf.mjs` from `assets/generated/spend-log.csv`. Any single job over $0.30 needs Boris's OK.
- **Performance:** mobile LCP under 2.5 s under real throttling, CLS under 0.05. Motion and 3D load after first paint and only on capable devices.
- **Accessibility:** reduced motion gets a complete static version, all content is reachable by keyboard, contrast is AA.
- No image is shown above 1.6× its native size.

## Checklist (scored 1–10)
1. Typography hierarchy and rhythm
2. Spacing consistency
3. Image quality and cropping
4. Scroll smoothness (no jank, 60 fps)
5. Signature moment feels intentional
6. Mobile layout and tap targets
7. Load speed
8. Accessibility (contrast, alt text, reduced motion, keyboard)
9. Copy sounds human and short
10. Her work is the clear hero
11. Nothing looks like a template
12. **3D and depth** (added by Boris)
13. **Scroll effects** (added by Boris)

## Ambition track (in order, interleaved with weakest-item fixes)
- A. Hero: her Aura render brought to life with Higgsfield image-to-video (slow push-in, lights warming), scrubbed by scroll as a WebP frame sequence on canvas. The static render stays the LCP image.
- B. 3D: an interactive Three.js massing of Aura Theatre in her red line (ring + slab + columns, taken from her plans and massing study), rotating with scroll and labelled as a massing diagram. Lazy-loaded, desktop and capable phones only.
- C. Project pages: depth parallax on renders, and drawings that draw in (clip reveals) on scroll.
- D. Section transitions: material textures (walnut, travertine) as scroll-driven wipes between dark and light sections.
- E. Per-project Higgsfield clips for the 1–2 strongest renders (Quiet Sailing lakeside, Health Center), within budget.

## Stop
When every item scores 9 or more, or the budget is spent.
