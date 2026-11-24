# Scores

Scale 1–10. Scores are averaged across all pages.

| # | Item | R1 (baseline) | R2 | Notes |
|---|---|---|---|---|
| 1 | Typography hierarchy| 7 | 7 | Literata display is strong. Body and caption sizes are fine; caption contrast is borderline in places |
| 2 | Spacing consistency| 7 | 7 | Section rhythm OK; project gallery gaps vary with image sizes |
| 3 | Image quality and cropping| 6 | 7 | Capped at 1.6×, but small originals still read soft; public-interiors is a grid crop |
| 4 | Scroll smoothness| 7 | 7 | Lenis + one pinned timeline; not yet profiled |
| 5 | Signature moment| 7 | 8 | Lights on reads as dusk now; mobile middle frame has an empty band |
| 6 | Mobile layout and tap targets| 7 | 7 | Good overall; menu works; work-list thumbs fine |
| 7 | Load speed| 8 | 8 | Real throttled LCP 1.8 s; simulated 3.6 s |
| 8 | Accessibility| 8 | 8 | Lighthouse 100, reduced motion OK, focus visible |
| 9 | Copy| 8 | 8 | Short and plain; MK needs native review |
| 10 | Her work is the hero| 8 | 8 | Renders and drawings lead every page |
| 11 | Not a template| 7 | 8 | Dark serif portfolio is a known genre; Lights on and drawings set it apart |
| 12 | 3D and depth| 2 | 6 | None yet |
| 13 | Scroll effects| 4 | 6 | One pinned moment and a hover preview; nothing else moves |

**Weakest: 12 (3D), then 13 (scroll effects).** Round 1 → ambition track A (hero motion from her render via Higgsfield, scroll-scrubbed).

## Log
- **R1 (track A):** hero motion study. Higgsfield Kling 2.5 Turbo Pro animated her Aura render ($0.263), checked frame by frame for geometry drift, then scrubbed as 25 WebP frames on canvas with crossfade. The hero pins for one screen. LCP unchanged (1.9 s throttled). Fixed pin ordering. → items 5, 13 up.
- **R2 (track B):** 3D massing of Aura Theatre in her red line (Three.js, axonometric camera). Assembles on scroll (footprint → glass → columns → roof → ring) and turns; drag and arrow keys rotate it. Lazy-loaded near view; her axonometry is the fallback. On home after Lights on, and on the Aura page. → items 12, 11 up.
- **R3 (track C, from reference 25):** focus frame on every project hero. A blurred render with a sharp framed window travels across the building as you scroll, then opens to the full image, with two short italic lines. It hides soft upscales and gives project pages their own scroll moment. Mobile frame tuned separately. → items 3, 13 up.
- Second inspiration batch logged (7 effect references): reeded-glass wipe queued for track D.
- **Next:** R4 track C (project pages: drawings draw in, render depth parallax), then fix the hard dark/travertine section edges (track D), and the mobile Lights-on empty band.
- **R4 (Cowork, v2 home):** Rigour rebuilt as a drafting table. One pin (3.1 vh desktop, 2.7 vh phone, still shorter than the peak). Each project lands as her own drawing on a sheet with a title block, a red plotter line prints her render over it top to bottom, then the next sheet lands on the pile (earlier sheets sink and darken). Top sheet tilts towards the pointer. Static stack for reduced motion. Phone uses square sheets. → items 4, 13 up.
- **R5:** Quiet Sailing pan cut from 7 items to 5 and sized by height (renders up to 60svh, sketches matted like paper). Pan length about 2.1 vh desktop (was about 3.6), images roughly twice as large. → items 3, 5 up.
- **R6:** three small fixes. Hero name scaled down so it sits clear of the roof instead of looking clipped. Peak: no more grey colour fade; travertine holds until her render covers the frame, and the line text turns light with the reveal. Phone 3D massing zoomed in about 18%, and its dusk colour starts only after the render covers it. → items 1, 5, 12 up.
