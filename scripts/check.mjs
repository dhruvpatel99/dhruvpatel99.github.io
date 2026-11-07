#!/usr/bin/env node
/**
 * Content and build check, run by `npm run check` and in the deploy workflow.
 * Fails (exit 1) if something would ship broken or wrong:
 *  - project data: unique ids, required fields, known category/status, https links, images exist
 *  - index.html: name, email and canonical URL match src/data/site.js; every #anchor exists
 *  - public/: resume.pdf and og.png exist
 *  - names that must never appear on the site
 *  - dist/ (if built): files present, no dev-only /src/ paths left
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const p = (...x) => resolve(root, ...x);
const load = (f) => import(pathToFileURL(p(f)).href);

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const { SITE, SECTIONS, METRICS } = await load('src/data/site.js');
const { PROJECTS, CATEGORIES, STATUS } = await load('src/data/projects.js');
const { EXPERIENCE, SKILLS, TOOL_GROUPS } = await load('src/data/experience.js');

/* ---------- Projects ---------- */
const ids = new Set();
for (const pr of PROJECTS) {
  const at = `project "${pr.id || pr.title}"`;
  if (!pr.id || !/^[a-z0-9-]+$/.test(pr.id)) fail(`${at}: id must be lowercase letters, numbers and dashes`);
  if (ids.has(pr.id)) fail(`${at}: duplicate id`);
  ids.add(pr.id);
  for (const k of ['title', 'summary', 'context', 'result', 'where']) if (!pr[k]) fail(`${at}: missing ${k}`);
  if (!CATEGORIES[pr.category]) fail(`${at}: unknown category "${pr.category}"`);
  if (!STATUS[pr.status]) fail(`${at}: unknown status "${pr.status}"`);
  if (!Array.isArray(pr.did) || !pr.did.length) fail(`${at}: "did" needs at least one line`);
  if (!Array.isArray(pr.tools) || !pr.tools.length) fail(`${at}: "tools" needs at least one tool`);
  if (!Array.isArray(pr.stages) || !pr.stages.every((s) => Array.isArray(s) && ['ok', 'wip', 'todo'].includes(s[1]))) fail(`${at}: stages must be [name, 'ok' | 'wip' | 'todo']`);
  for (const l of pr.links || []) if (!/^https:\/\//.test(l.url) || !l.label) fail(`${at}: link "${l.label}" must have a label and an https:// URL`);
  if (pr.image && !existsSync(p('public', pr.image))) fail(`${at}: image public/${pr.image} not found`);
}
if (!PROJECTS.some((x) => x.featured)) warn('no featured projects: "Selected work" will be empty');
if (PROJECTS.filter((x) => x.featured).length > 4) warn('more than 4 featured projects: keep the strongest 2-4');

/* ---------- Other data ---------- */
if (!EXPERIENCE.length) fail('experience is empty');
EXPERIENCE.forEach((x, i) => { if (!x.role || !x.org || !x.when) fail(`experience #${i + 1}: role, org and when are required`); });
if (!SKILLS.length) warn('skills list is empty');
if (!TOOL_GROUPS.every((g) => g.tools.every((t) => t.length === 2))) fail('each tool must be [name, what I use it for]');
if (!METRICS.every((m) => Number.isFinite(m.value) && m.label)) fail('metrics need a number and a label');

/* ---------- index.html ---------- */
const html = readFileSync(p('index.html'), 'utf8');
if (!html.includes(SITE.email)) fail(`index.html does not mention ${SITE.email} (update it to match src/data/site.js)`);
if (!html.includes(SITE.name)) fail(`index.html does not mention ${SITE.name}`);
const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
if (canonical !== SITE.url) fail(`canonical URL is ${canonical}, expected ${SITE.url}`);
const htmlIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
for (const s of SECTIONS) if (!htmlIds.has(s.id)) fail(`section "${s.id}" is in SECTIONS but has no element with that id`);
for (const [, id] of html.matchAll(/href="#([^"]*)"/g)) if (id && !htmlIds.has(id)) fail(`link to #${id} has no matching id`);
if (/\[(YOUR|PLACEHOLDER)[^\]]*\]/i.test(html)) fail('index.html still contains a [PLACEHOLDER]');

/* ---------- public/ ---------- */
if (!existsSync(p('public/resume.pdf'))) fail('public/resume.pdf is missing (Download CV buttons would break)');
const og = html.match(/property="og:image" content="([^"]+)"/)?.[1];
if (og && !existsSync(p('public', og.split('/').pop()))) fail(`share image ${og} not found in public/`);

/* ---------- Things that must never be published ---------- */
const NEVER = ['ValuAIPro', 'ValuPro'];
const allText = [html, JSON.stringify({ SITE, PROJECTS, EXPERIENCE, SKILLS, TOOL_GROUPS })].join('\n');
for (const word of NEVER) if (allText.toLowerCase().includes(word.toLowerCase())) fail(`"${word}" appears on the site`);
for (const ip of allText.match(/\b(?:10|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}(?:\.\d{1,3})?\b/g) || []) fail(`private IP address ${ip} appears on the site`);

/* ---------- dist/ (after npm run build) ---------- */
if (existsSync(p('dist'))) {
  for (const f of ['index.html', 'resume.pdf', 'og.png']) if (!existsSync(p('dist', f))) fail(`dist/${f} is missing`);
  if (existsSync(p('dist/index.html')) && readFileSync(p('dist/index.html'), 'utf8').includes('/src/')) fail('dist/index.html still points at /src/ (build did not run?)');
} else {
  warn('dist/ not found: run `npm run build` first to check the build output too');
}

warnings.forEach((w) => console.log(`::warning::${w}`));
if (errors.length) {
  errors.forEach((e) => console.log(`::error::${e}`));
  console.log(`\n✗ check failed: ${errors.length} problem${errors.length > 1 ? 's' : ''}`);
  process.exit(1);
}
console.log(`✓ check passed: ${PROJECTS.length} projects, ${EXPERIENCE.length} roles, ${SECTIONS.length} sections, links and files OK`);
