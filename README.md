# Dhruv Patel – Portfolio

Personal portfolio website: **https://dhruvpatel99.github.io**

A single static page (HTML + CSS + a few lines of JavaScript, no framework), deployed to GitHub Pages by a GitHub Actions workflow on every push to `main`.

## What's inside

```
.
├── index.html                    # the whole site
├── resume.pdf                    # CV used by the "Download CV" button
└── .github/workflows/deploy.yml  # CI/CD: check files, then deploy to GitHub Pages
```

## How it deploys

1. A push to `main` starts the **Deploy portfolio to GitHub Pages** workflow.
2. The `check` job makes sure `index.html` exists and warns if `resume.pdf` is missing.
3. The `deploy` job packages the files and publishes them to GitHub Pages.
4. The live URL is shown in the workflow run summary.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Update the content

All text lives in `index.html`:

- **Career run (hero console)** – the `JOBS` list in the `<script>` at the bottom. Each job has an `id`, a `when` label and log `lines`: `"cmd"` prints a `$ Run …` command, `"ok"` a green tick step, `"wip"` an amber in-progress step. `keepRunning: true` leaves that job spinning.
- **Projects** – the `<section id="projects">` block. Each project is a `<details>` "workflow run"; copy one to add a project. `data-icon="pass"` shows a green tick, `data-icon="run"` a spinner. Update the counts in `runs-head` too.
- **Experience** – the `<section id="experience">` block. Each bullet in `<ol class="steps">` is a step; add `class="wip"` for work still in progress.
- **Skills** – the `<div class="matrix">` cells.

## Page features

- Hero console replays your career as a CI run, with a **Re-run all jobs** button.
- The top navigation is a pipeline: sections before the one you're reading turn green, the current one turns amber.
- The badge in the top bar is the live status of `deploy.yml` from this repo.
- Respects dark mode and the "reduce motion" setting (the run shows finished instantly).
