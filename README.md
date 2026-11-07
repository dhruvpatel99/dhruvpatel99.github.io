# Dhruv Patel – portfolio (v4, editorial)

Live site: **https://dhruvpatel99.github.io**

A static portfolio built with **Vite + vanilla JavaScript + Three.js + GSAP**, deployed to GitHub Pages by GitHub Actions.

v4 is a restyle in a cinematic, editorial direction: near-black `#090909`, warm off-white `#F2EFEB`, one red accent `#E32B3C`, huge condensed headlines (Anton), calm body text (Manrope) and handwritten notes (Caveat). The hero keeps the 3D CI/CD infinity loop (Plan → Code → Build → Test → Release → Deploy → Operate → Monitor), recoloured to match.

---

## Edit your details here

All personal content lives in **`src/data/`**. You never need to touch the components to change text.

| File | What's in it |
| --- | --- |
| `src/data/site.js` | name, role, email, links, CV path, hero numbers, section list (header, mobile menu and command palette all read it) |
| `src/data/projects.js` | every project: category, year, status, the story (why / what I did / result), pipeline stages, tools, links, optional screenshot |
| `src/data/experience.js` | jobs, education, "What I'm trusted with" and the toolbox |

`index.html` holds the static hero text and the SEO tags (title, description, Open Graph, JSON-LD). If you change your email or name, update both; `npm run check` fails if they don't match.

**Adding a project screenshot:** put it in `public/projects/` (WebP, about 1600 px wide), blur internal IPs, hostnames and client data, then set `image: 'projects/your-file.webp'` on the project. It replaces the drawn pipeline on the card and shows in the popup.

**Featured projects:** set `featured: true` on your 2–4 strongest projects. They get the large cards in "Selected work"; every project is also in the searchable index.

---

## What's on the page

| Feature | Notes | File |
| --- | --- | --- |
| Intro curtain | name, count to 100, curtain lifts; once per browser tab | `src/ui/loader.js` |
| Motion on/off button | in the header; remembered in the browser; defaults to the system "reduce motion" setting; pauses the 3D loop, marquee, dashboard, rollout and reveals | `src/ui/motion.js` |
| Mobile menu | full-screen, Escape closes, focus stays inside | `src/ui/menu.js` |
| Selected work + project index | category filters, search, Load more, empty state | `src/ui/projects.js` |
| Project popup | Escape / backdrop / ✕ close it, focus returns; deep links like `#work/k3s-migration` | `src/ui/projects.js` |
| k8s rolling update | live animation inside the k3s project popup | `src/ui/rollout.js` |
| Experience timeline | expandable rows (current role open) | `src/ui/render.js` |
| Ops board | six real numbers, demo graph and Loki-style log tail | `src/ui/dashboard.js` |
| Terminal | `help`, `neofetch`, `kubectl get pods`, `gh run list` (live) | `src/ui/terminal.js` |
| Command palette | Ctrl K / ⌘K or `/`: sections, every project, copy email, motion | `src/ui/palette.js` |
| Contact form | opens the visitor's own email app with the message filled in; never claims to send anything | `src/ui/contact.js` |
| Live deploy status | footer reads the latest GitHub Actions run | `src/ui/live.js` |

## Run locally

Requirements: Node.js 20+.

```bash
npm install      # first time only
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run check    # content, links and build-output check
npm run preview  # serve dist/
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`:

1. `npm ci` installs the exact versions from `package-lock.json`.
2. `npm run build` builds the site into `dist/`.
3. `npm run check` stops the deploy if anything is wrong (see below).
4. `dist/` is published to GitHub Pages.

One-time setup: **Settings → Pages → Source: GitHub Actions**. `vite.config.js` uses `base: '/'` because this is a user site.

### What `npm run check` catches

- project data: duplicate or bad ids, missing fields, unknown category or status, non-https links, missing screenshots
- `index.html`: email, name or canonical URL out of sync with `src/data/site.js`; any `#link` without a matching section
- missing `public/resume.pdf` or `public/og.png`
- private IP addresses (10.x, 172.16–31.x, 192.168.x) and names that must never be published
- after a build: missing files in `dist/`, or dev-only `/src/` paths left in `dist/index.html`

## Project structure

```
index.html                 hero text, section shells, SEO tags
public/resume.pdf          your CV (copied to the site root)
public/og.png              1200×630 share image for LinkedIn, WhatsApp, X
scripts/check.mjs          the content/link/build check
src/
  main.js                  entry: motion setting, WebGL check, intro, scene, motion toggle
  config.js                3D colours, stage labels, speeds, intro timings
  data/                    ← all personal content (see above)
  scene/                   the 3D loop: createScene, infinityLoop, intro, scrollScene
  ui/                      page behaviour (one module per feature, see the table)
  styles/site.css          the whole design; colour and font tokens at the top
.github/workflows/deploy.yml
```

## Design tokens

At the top of `src/styles/site.css`:

```css
--bg: #090909;   --text: #F2EFEB;   --muted: #A09C9A;
--accent: #E32B3C;        /* large type, fills, lines */
--accent-text: #FF5666;   /* red for small text (passes contrast on black) */
--display: "Anton";  --sans: "Manrope";  --hand: "Caveat";  --mono: "JetBrains Mono";
```

The 3D loop's colours are in `COLORS` in `src/config.js`; keep them in step with the CSS.

## Accessibility and fallbacks

- **Motion off** (button or system setting): no intro curtain, no fly-in, packets parked, no marquee or reveals; the loop is a still frame that still follows scrolling.
- **No WebGL**: the hero shows a static SVG of the loop; all content is the same.
- One `<h1>`, landmarks, a skip link, visible focus rings, 44 px tap targets on phones, labelled controls, focus management in the menu, popup and palette, `aria-live` for search results and the terminal.
- No horizontal scrolling from 320 px up; tested at 1440, 768, 390 and 320 px.
