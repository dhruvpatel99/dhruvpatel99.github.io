/**
 * Work section, built from src/data/projects.js:
 *  - "Selected work": large cards for featured projects
 *  - "Project index": every project, with category filters, search and Load more
 *  - a details popup for each project (Escape, backdrop or ✕ closes it;
 *    focus goes back to whatever opened it). #work/<id> links open it directly.
 */
import { PROJECTS, CATEGORIES, STATUS } from '../data/projects.js';
import { esc } from './render.js';
import { motion } from './motion.js';
import { startRollout } from './rollout.js';

const PAGE = 6;
const byId = new Map(PROJECTS.map((p) => [p.id, p]));

const flow = (stages) => `<ol class="flow" aria-label="Stages: ${esc(stages.map(([n, s]) => `${n} ${s === 'ok' ? 'done' : s === 'wip' ? 'in progress' : 'next'}`).join(', '))}">${
  stages.map(([n, s]) => `<li class="${s}"><span class="node"></span><span>${esc(n)}</span></li>`).join('')}</ol>`;
const status = (p) => `<span class="status s-${p.status}">${STATUS[p.status]}</span>`;
const meta = (p) => [CATEGORIES[p.category], p.year, p.where].filter(Boolean);
const ext = (l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}<svg aria-hidden="true"><use href="#i-arrow"/></svg></a>`;

/* ---------- Selected work ---------- */
function renderFeatured() {
  const el = document.getElementById('featured');
  if (!el) return;
  const list = PROJECTS.filter((p) => p.featured);
  el.innerHTML = list.map((p, i) => {
    const [cat, ...rest] = meta(p);
    return `
    <article class="feat" data-reveal>
      <div class="feat-visual" data-open="${p.id}" aria-hidden="true">
        <span class="feat-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="feat-badge">${status(p)}</span>
        ${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" decoding="async" width="1200" height="900">` : flow(p.stages)}
      </div>
      <div class="feat-copy">
        <p class="feat-meta"><span class="cat">${esc(cat)}</span>${rest.map((m) => `<span>${esc(m)}</span>`).join('')}</p>
        <h3><button type="button" data-open="${p.id}">${esc(p.title)}</button></h3>
        <p class="sum">${esc(p.summary)}</p>
        <ul class="tags">${p.tools.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <div class="feat-actions">
          <button class="btn primary" type="button" data-open="${p.id}">Read the case<svg aria-hidden="true"><use href="#i-arrow"/></svg></button>
          ${p.links.map(ext).join('')}
        </div>
      </div>
    </article>`;
  }).join('');
}

/* ---------- Project index ---------- */
function initIndex() {
  const list = document.getElementById('projIndex');
  const filters = document.getElementById('filters');
  const ink = document.getElementById('filtersInk');
  const search = document.getElementById('projSearch');
  const more = document.getElementById('projMore');
  const empty = document.getElementById('projEmpty');
  const reset = document.getElementById('projReset');
  const count = document.getElementById('projCount');
  if (!list || !filters) return;

  const cats = Object.keys(CATEGORIES).filter((c) => PROJECTS.some((p) => p.category === c));
  filters.insertAdjacentHTML('beforeend', [['all', 'All', PROJECTS.length], ...cats.map((c) => [c, CATEGORIES[c], PROJECTS.filter((p) => p.category === c).length])]
    .map(([key, label, n]) => `<button class="filter" type="button" data-filter="${key}" aria-pressed="${key === 'all'}">${esc(label)}<sup>${n}</sup></button>`).join(''));
  const buttons = [...filters.querySelectorAll('.filter')];

  let cat = 'all';
  let query = '';
  let shown = PAGE;

  const matches = () => {
    const q = query.trim().toLowerCase();
    return PROJECTS.filter((p) => (cat === 'all' || p.category === cat) && (!q || [p.title, p.summary, p.where, CATEGORIES[p.category], STATUS[p.status], ...p.tools].join(' ').toLowerCase().includes(q)));
  };

  function moveInk() {
    const b = buttons.find((x) => x.dataset.filter === cat);
    if (!b || !ink) return;
    ink.style.width = `${b.offsetWidth - 28}px`;
    ink.style.transform = `translateX(${b.offsetLeft + 14}px)`;
  }

  function render({ animate = true, from = 0 } = {}) {
    const all = matches();
    const page = all.slice(0, shown);
    list.innerHTML = page.map((p, i) => `
      <li class="proj-row${animate && motion.on && i >= from ? ' enter' : ''}" style="animation-delay:${Math.max(0, i - from) * 45}ms">
        <button type="button" data-open="${p.id}">
          <span class="pr-n">${String(PROJECTS.indexOf(p) + 1).padStart(2, '0')}</span>
          <span class="pr-title">${esc(p.title)}<small>${esc(p.summary)}</small></span>
          <span class="pr-cat">${esc(CATEGORIES[p.category])}</span>
          <span class="pr-year">${esc(p.year || '—')}</span>
          ${status(p)}
          <svg class="pr-arrow" aria-hidden="true"><use href="#i-arrow"/></svg>
        </button>
      </li>`).join('');
    empty.hidden = all.length > 0;
    more.hidden = all.length <= shown;
    more.textContent = `Load more (${all.length - shown})`;
    count.textContent = `${all.length} project${all.length === 1 ? '' : 's'} shown`;
  }

  buttons.forEach((b) => b.addEventListener('click', () => {
    cat = b.dataset.filter;
    shown = PAGE;
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    moveInk();
    render();
  }));
  let t = 0;
  search.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => { query = search.value; shown = PAGE; render(); }, 120);
  });
  search.addEventListener('keydown', (e) => { if (e.key === 'Escape' && search.value) { e.stopPropagation(); search.value = ''; query = ''; render(); } });
  more.addEventListener('click', () => {
    const from = shown;
    shown += PAGE;
    render({ from });
    list.children[from]?.querySelector('button')?.focus({ preventScroll: true });
  });
  reset.addEventListener('click', () => {
    search.value = ''; query = ''; cat = 'all'; shown = PAGE;
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.filter === 'all')));
    moveInk(); render(); search.focus();
  });

  render({ animate: false });
  requestAnimationFrame(moveInk);
  document.fonts?.ready.then(moveInk);
  window.addEventListener('resize', moveInk);
}

/* ---------- Details popup ---------- */
function initDialog() {
  const dlg = document.getElementById('projDialog');
  const body = document.getElementById('pdBody');
  const closeBtn = document.getElementById('pdClose');
  if (!dlg || !body || typeof dlg.showModal !== 'function') return () => {};
  let opener = null;
  let stopDemo = null;

  function fill(p) {
    const [cat, ...rest] = meta(p);
    body.innerHTML = `
      <p class="pd-meta"><span class="cat">${esc(cat)}</span>${rest.map((m) => `<span>${esc(m)}</span>`).join('')}${status(p)}</p>
      <h2 class="pd-title" id="pdTitle">${esc(p.title)}</h2>
      <p class="pd-summary">${esc(p.summary)}</p>
      ${p.image ? `<img class="pd-flow" src="${esc(p.image)}" alt="Screenshot: ${esc(p.title)}" loading="lazy" decoding="async">` : ''}
      <div class="pd-flow">${flow(p.stages)}</div>
      ${p.demo === 'rollout' ? `<div class="pd-demo"><div class="rollout" data-rollout aria-hidden="true">
          <div class="ro-head"><span class="ro-cmd">$ kubectl rollout status deploy/enotary</span><span class="ro-ready"><b data-ro-ready>6</b>/6 ready</span></div>
          <div class="ro-pods" data-ro-pods></div>
          <div class="ro-foot"><span data-ro-msg>waiting for rollout…</span><span class="ro-avail">availability <b>100%</b></span></div>
        </div><p class="sr-only">Animation: a rolling update replaces the 6 pods one at a time, so 6 of 6 stay ready the whole way through.</p></div>` : ''}
      <div class="pd-grid">
        <div>
          <h4>Why it exists</h4>
          <p>${esc(p.context)}</p>
          <h4>What I did</h4>
          <ol class="pd-did">${p.did.map((d) => `<li>${esc(d)}</li>`).join('')}</ol>
        </div>
        <div>
          <h4>Result</h4>
          <p class="pd-result">${esc(p.result)}</p>
          <h4>Tools</h4>
          <ul class="tags">${p.tools.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          ${p.links.length ? `<div class="pd-links">${p.links.map(ext).join('')}</div>` : '<p class="pd-note">Company work: the code and servers are private.</p>'}
        </div>
      </div>`;
  }

  function open(id, trigger) {
    const p = byId.get(id);
    if (!p) return;
    opener = trigger || document.activeElement;
    fill(p);
    dlg.classList.remove('closing');
    dlg.showModal();
    dlg.querySelector('.pd-inner').scrollTop = 0;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
    const demo = dlg.querySelector('[data-rollout]');
    if (demo) stopDemo = startRollout(demo);
    history.replaceState(null, '', `#work/${id}`);
  }

  function close() {
    if (!dlg.open) return;
    stopDemo?.(); stopDemo = null;
    const done = () => {
      dlg.close();
      dlg.classList.remove('closing');
      document.body.style.overflow = '';
      history.replaceState(null, '', '#work');
      opener?.focus?.({ preventScroll: true });
    };
    if (motion.on) { dlg.classList.add('closing'); setTimeout(done, 220); } else done();
  }

  closeBtn.addEventListener('click', close);
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); }); // Escape
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); }); // backdrop
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open]');
    if (!t) return;
    // The big visual is decorative for screen readers: send focus back to its title button.
    const trigger = t.matches('button') ? t : t.closest('.feat')?.querySelector('h3 button');
    open(t.dataset.open, trigger);
  });

  // Deep link: #work/<id>
  const fromHash = () => {
    const m = location.hash.match(/^#work\/([\w-]+)$/);
    if (m && byId.has(m[1]) && !dlg.open) {
      document.getElementById('work')?.scrollIntoView();
      open(m[1], document.querySelector(`.proj-row [data-open="${m[1]}"]`));
    }
  };
  window.addEventListener('hashchange', fromHash);
  return fromHash;
}

export function initProjects() {
  renderFeatured();
  initIndex();
  const openFromHash = initDialog();
  return { openFromHash };
}
