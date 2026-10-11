# Dhruv Patel – Portfolio

Personal portfolio website: **https://dhruvpatel99.github.io**

A static site (HTML, CSS and plain JavaScript, no build step) with a small 3D assistant in the hero built with three.js. It is deployed to GitHub Pages by a GitHub Actions workflow on every push to `main`.

## What's inside

```
.
├── index.html                      # page content and structure
├── resume.pdf                      # CV for the "Download CV" button
├── assets/
│   ├── css/main.css                # theme and layout
│   ├── js/main.js                  # career run console, nav, reveals, stack filters, agent log
│   ├── js/robot.js                 # 3D ops-agent (three.js, built from simple shapes)
│   └── vendor/three/               # three.js r160 + two add-ons, served locally (MIT licence)
└── .github/workflows/deploy.yml    # CI/CD: check files, then deploy to GitHub Pages
```

## How it deploys

1. A push to `main` starts the **Deploy portfolio to GitHub Pages** workflow.
2. The `check` job makes sure `index.html` exists and warns if `resume.pdf` is missing.
3. The `deploy` job packages the files and publishes them to GitHub Pages.

## Run it locally

The 3D robot loads JavaScript modules, so open the site through a local server, not by double-clicking the file:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Update the content

- **Hero, About, Skills, Experience, Projects, Stack** – edit the matching `<section>` in `index.html`.
- **Career run console** – the `JOBS` list in `assets/js/main.js` (`cmd` = command line, `ok` = green tick, `wip` = in progress).
- **Robot's log lines** – the `AGENT_LINES` list in `assets/js/main.js`.
- **Project status** – `data-icon="pass"` (tick) or `data-icon="run"` (spinner); pipeline stages use `class="ok"` or `class="wip"`.
- **Tech stack filters** – each tool card has `data-cat` = `cicd`, `infra`, `obs` or `data`.

## Performance and accessibility

- The 3D view only renders while it is on screen, pauses in background tabs, and caps pixel density.
- With "reduce motion" turned on, animations stop and the robot shows a still pose.
- If WebGL is not available, the hero still works and shows the agent log.
