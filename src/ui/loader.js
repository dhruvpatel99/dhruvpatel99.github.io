/**
 * Intro curtain, drawn as a CI/CD run: checkout → install → build → test → deploy.
 * The first jobs pass on a short timer; "test" only passes once the page and the
 * 3D scene are really ready (finish() is called), then "deploy" runs, the status
 * turns to "Deployed", and the curtain lifts. A real clock counts the run time.
 * Skipped with motion off and on repeat visits in the same tab session.
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function startLoader({ reduced = false } = {}) {
  const root = document.getElementById('intro');
  const pipe = document.getElementById('introPipe');
  const status = document.getElementById('introStatus');
  const clock = document.getElementById('introClock');
  const started = performance.now();
  let seen = false;
  try { seen = sessionStorage.getItem('dp-intro') === '1'; sessionStorage.setItem('dp-intro', '1'); } catch { /* ignore */ }
  const skip = reduced || seen || !root || !pipe;
  if (skip) root?.remove();

  const jobs = skip ? [] : [...pipe.children];
  const names = jobs.map((li) => li.querySelector('.ip-name').textContent);
  let raf = 0;
  let readyResolve;
  const ready = new Promise((r) => { readyResolve = r; });
  let liftResolve;
  const lifted = new Promise((r) => { liftResolve = r; });

  const tick = () => {
    clock.textContent = `${((performance.now() - started) / 1000).toFixed(1)}s`;
    raf = requestAnimationFrame(tick);
  };

  async function run() {
    raf = requestAnimationFrame(tick);
    const timing = [180, 260, 320, 240]; // checkout, install, build, test (minimum)
    for (let k = 0; k < jobs.length; k++) {
      const li = jobs[k];
      const t0 = performance.now();
      li.classList.add('run');
      pipe.style.setProperty('--p', String(k / (jobs.length - 1))); // the red line reaches this job
      status.textContent = k === jobs.length - 1 ? 'Deploying to GitHub Pages' : `Running ${names[k]}`;
      await sleep(timing[k] ?? 420);
      if (names[k] === 'test') await ready; // waits for the real page to be ready
      li.classList.replace('run', 'ok');
      li.querySelector('.ip-time').textContent = `${((performance.now() - t0) / 1000).toFixed(1)}s`;
    }
    cancelAnimationFrame(raf);
    clock.textContent = `${((performance.now() - started) / 1000).toFixed(1)}s`;
    status.textContent = 'Deployed · all checks passed';
    root.classList.add('live');
    await sleep(520);
    root.classList.add('done');
    await sleep(450);
    liftResolve();
    setTimeout(() => root.remove(), 700);
  }
  if (!skip) run();

  /** The page is ready: let "test" pass after the minimum time, then wait for the lift. */
  async function finish({ minTime = 0.9 } = {}) {
    if (skip || !root?.isConnected) { root?.remove(); return; }
    const wait = Math.max(0, minTime * 1000 - (performance.now() - started));
    await sleep(wait);
    readyResolve();
    await lifted;
  }

  return { finish, skipped: skip };
}
