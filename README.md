# Dhruv Patel – 3D portfolio

Live site: **https://dhruvpatel99.github.io**

A static portfolio built with **Vite + vanilla JavaScript + Three.js + GSAP**. The hero is a 3D CI/CD infinity loop: the DevOps lifecycle as a glowing figure-8 with packets travelling through Plan → Code → Build → Test → Release → Deploy → Operate → Monitor. It deploys to GitHub Pages with GitHub Actions.

All page content is real, semantic HTML. The 3D scene is a decorative layer behind it, so screen readers, search engines and browsers without WebGL get the full site.

---

## Run locally

Requirements: Node.js 20+.

```bash
npm install      # first time only; creates package-lock.json (commit it)
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve dist/ to check the build
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`:

1. `npm ci` installs the exact versions from `package-lock.json`.
2. `npm run build` builds the site into `dist/`.
3. The workflow checks that `dist/index.html` exists and warns if `resume.pdf` is missing.
4. `dist/` is published to GitHub Pages.

One-time setup: **Settings → Pages → Source: GitHub Actions**. `vite.config.js` uses `base: '/'` because this is a user site (`<user>.github.io`). For a project site, set `base: '/<repo-name>/'`.

`resume.pdf` lives in `public/`. Vite copies it to the site root, so the "Download CV" link keeps working.

---

## Project structure

```
index.html                 all page content (semantic HTML) + SEO tags
public/resume.pdf          your CV (copied as-is to the site root)
src/
  main.js                  entry: detects WebGL / reduced motion / phone, boots everything
  config.js                colours, stage labels, speeds, intro timings  ← tweak here
  scene/
    createScene.js         renderer, camera rig, bloom, particles, grid, render loop
    infinityLoop.js        the loop: curve, tube, 8 stage nodes, labels, packets
    intro.js               GSAP intro timeline (fly-in, draw, nodes, text, packets)
    scrollScene.js         ScrollTrigger: hero hand-off + slow drift while reading
  ui/
    loader.js              terminal boot screen
    nav.js                 pipeline-style top navigation
    reveal.js              3D scroll reveals, timeline swing-in, project pipelines
    tilt.js                pointer-driven 3D tilt for cards
    career.js              career.yml run (4 floating job panels)
    cloud.js               tech-stack sphere with filters and details
    workflow.js            contact "Run workflow" animation
    icons.js               passed / running / queued icons
  styles/main.css          all styles (colour tokens at the top)
.github/workflows/deploy.yml
```

## Architecture

- **One fixed `<canvas>`** sits behind the page and renders the loop, a particle field and a faint grid floor. Stage labels are HTML (`CSS2DRenderer`), so they stay crisp at any size.
- **Page sections are normal HTML.** Their 3D feel comes from CSS 3D transforms driven by GSAP: tilt cards, floating job panels, a perspective timeline and a projected tool sphere. They work and stay readable without WebGL.
- **The 3D code is loaded only when WebGL works** (a dynamic `import()`), so the 2D fallback stays light. three.js and GSAP are split into their own cached files.
- **The scene is driven by three values (0..1)**, all set with GSAP:
  - `intro` is the camera fly-in.
  - `hero` is the scroll hand-off, where the loop moves to the right edge and fades into a backdrop.
  - `page` is a slow drift of the camera and loop across the whole page.

## Animation timeline (hero)

| Time | What happens | Easing |
| --- | --- | --- |
| 0.0–1.1 s | Terminal boot screen types its lines; the scene is built and shaders compile behind it | – |
| 0.0–2.8 s | Camera pushes in from far away (z 62 → fitted distance) | `expo.out` |
| 0.0–2.6 s | Loop scales 0.72 → 1 and unwinds its spin −0.9 → 0 rad | `power3.out` |
| 0.25–2.15 s | Tube draws itself along its length | `power2.inOut` |
| 1.1 s + 0.08 s each | The 8 stage nodes pop in, Plan → Monitor | `back.out(2.2)` |
| 1.35 s + 0.09 s each | Name, headline, summary, buttons and stats fade up 24 px | `power3.out`, 0.8 s |
| 2.0 s → | Packets start moving (one lap ≈ 22 s); each node pulses and its label lights up when a packet passes | linear |
| Scroll | Through the hero, the loop shrinks, moves to the right edge, fades to ~26% and its labels fade out | scrubbed (0.6 s smoothing) |

The timings are all in `INTRO` in `src/config.js`.

## Performance

- Pixel ratio is capped at 2 (1.5 on phones); bloom renders at a pixel ratio of 1.5 or less.
- Nodes, rings, packets and trails use `InstancedMesh` (4 draw calls for all of them).
- The render loop stops when the tab is hidden. Once the loop is only a backdrop, it draws at half rate.
- On phones there's no bloom (a soft glow tube is used instead), fewer particles and packets, and simpler geometry.
- Everything is generated in code. There are no models or textures to download.
- GPU resources are disposed when the page is closed.

## Accessibility and fallbacks

- **`prefers-reduced-motion`**: no boot animation, no fly-in, no moving packets or auto-rotation. You get a single still frame of the loop and every section in its final state.
- **No WebGL**: the canvas is skipped and the hero shows a static SVG drawing of the loop. All content is the same.
- Semantic headings, landmarks, a "Skip to projects" link, visible focus rings, `aria-live` regions for the tool details and the workflow run, and a hidden text list of all tools.
- Title, description, Open Graph tags, canonical URL and JSON-LD are kept from the original site.

---

## Tweaks

All in **`src/config.js`**. Keep the CSS colours in `src/styles/main.css` (`:root`) in sync.

**Colours**
```js
export const COLORS = {
  background: 0x090c11,
  dev: 0x3fd8f5,     // Plan / Code / Build / Test lobe
  ops: 0x3ddc97,     // Release / Deploy / Operate / Monitor lobe
  packet: 0xf5b544,  // travelling packets
  accent: 0xff5ccb,  // node flash
  ...
};
```

**Loop speed and packets**
```js
export const PACKETS = { count: 5, countMobile: 3, speed: 0.045, trail: 7, trailGap: 0.006 };
export const LOOP = { size: 4.2, depth: 0.9, tubeRadius: 0.075, idleSpin: 0.06, ... };
```
`speed` is laps per second (0.045 ≈ one lap every 22 s). `idleSpin` is the gentle rocking of the loop.

**Node labels**
```js
export const STAGES = [
  { name: 'Plan', lobe: 'dev', at: 0.3125 },
  ...
];
```
Change `name` to relabel a stage. `at` is the position along the loop (0..1): the left lobe covers 0.25–0.75 and the right lobe 0.75–1.25.

**Glow**: `BLOOM = { strength, radius, threshold }`. Raise `threshold` or lower `strength` for less glow.

**Camera**: `CAMERA.start` (where the fly-in begins), `CAMERA.parallax` (pointer drift) and `CAMERA.tilt` (how far the loop leans towards the pointer).
