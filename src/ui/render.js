/**
 * Builds the content sections from src/data: hero numbers, skills,
 * experience (expandable), education and the toolbox.
 * Projects have their own module (projects.js).
 */
import { SITE, METRICS } from '../data/site.js';
import { EXPERIENCE, EDUCATION, SKILLS, TOOL_GROUPS } from '../data/experience.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function metrics() {
  const el = document.getElementById('metrics');
  if (!el) return;
  el.innerHTML = METRICS.map((m) => `<li><b data-count="${m.value}" data-suffix="${esc(m.suffix)}">${m.value}${esc(m.suffix)}</b><span>${esc(m.label)}</span></li>`).join('');
}

function skills() {
  const el = document.getElementById('skills');
  if (!el) return;
  el.innerHTML = SKILLS.map((s, i) => `
    <li class="skill" data-reveal>
      <span class="skill-n">${String(i + 1).padStart(2, '0')}</span>
      <h4>${esc(s.title)}</h4>
      <p>${esc(s.text)}</p>
      <ul class="tags">${s.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </li>`).join('');
}

function experience() {
  const el = document.getElementById('xpList');
  if (!el) return;
  el.innerHTML = EXPERIENCE.map((x, i) => {
    const id = `xp-${i}`;
    const open = i === 0;
    return `
    <li class="xp${open ? ' open' : ''}" data-reveal>
      <h3 class="sr-only">${esc(x.role)}, ${esc(x.org)}</h3>
      <button class="xp-head" type="button" aria-expanded="${open}" aria-controls="${id}">
        <span><span class="xp-role">${esc(x.role)}</span><span class="xp-org">${esc(x.org)} · ${esc(x.place)}</span></span>
        <span class="xp-when">${x.current ? '<span class="status s-progress">Current</span>' : ''}${esc(x.when)}</span>
        <span class="xp-plus" aria-hidden="true"></span>
      </button>
      <div class="xp-body" id="${id}" role="region" aria-label="${esc(x.role)} details"${open ? '' : ' inert'}>
        <div>
          <div class="xp-content">
            <div>
              <p>${esc(x.summary)}</p>
              ${x.products.length ? `<ul class="tags xp-products" aria-label="Applications I deploy">${x.products.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
            </div>
            <ul class="xp-points">${x.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
          </div>
        </div>
      </div>
    </li>`;
  }).join('');

  el.querySelectorAll('.xp-head').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.xp');
      const body = item.querySelector('.xp-body');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      item.classList.toggle('open', !isOpen);
      body.inert = isOpen;
    });
  });

  const edu = document.getElementById('eduList');
  if (edu) edu.innerHTML = EDUCATION.map((e) => `<li data-reveal><small>${esc(e.when)}</small><b>${esc(e.title)}</b><span>${esc(e.org)}</span></li>`).join('');
}

function tools() {
  const el = document.getElementById('toolGroups');
  if (!el) return;
  el.innerHTML = TOOL_GROUPS.map((g) => `
    <div class="tool-group" data-reveal>
      <h3>${esc(g.name)}</h3>
      <ul>${g.tools.map(([name, what]) => `<li class="tool"><b>${esc(name)}</b><span>${esc(what)}</span></li>`).join('')}</ul>
    </div>`).join('');
}

/** Fill every [data-bind="email"] link from the site settings. */
function binds() {
  document.querySelectorAll('[data-bind="email"]').forEach((a) => {
    a.href = `mailto:${SITE.email}`;
    a.textContent = SITE.email;
  });
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
}

/** Make the big hero name fill the width exactly (one line on wide screens, two on phones). */
function fitName() {
  const h = document.querySelector('.hero-name');
  if (!h) return;
  const fit = () => {
    h.style.setProperty('--fit', '100px');
    const stacked = getComputedStyle(h).flexDirection === 'column';
    const lines = [...h.querySelectorAll('.hn')];
    const gap = stacked ? 0 : 22; // column-gap .22em at 100px
    const need = stacked ? Math.max(...lines.map((l) => l.scrollWidth)) : lines.reduce((a, l) => a + l.scrollWidth, 0) + gap;
    const room = h.clientWidth;
    if (need > 0) h.style.setProperty('--fit', `${Math.floor((room / need) * 100 * 0.995)}px`);
  };
  fit();
  document.fonts?.ready.then(fit);
  let t = 0;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(fit, 80); });
}

export function renderContent() {
  fitName();
  metrics();
  skills();
  experience();
  tools();
  binds();
}
