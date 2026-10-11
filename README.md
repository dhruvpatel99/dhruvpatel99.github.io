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

- Projects – the `<section id="projects">` block; copy one `<article class="row">` to add a project.
- Experience – the `<section id="experience">` block.
- Skills – the `<dl class="skills">` list.
- Career timeline – the `<ol class="stages">` list. `data-state="done"` shows a green tick, `data-state="running"` shows the amber "Running" stage.
