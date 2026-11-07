/**
 * Intro curtain: the name, a count from 00 to 100 and a red line,
 * then the curtain lifts. Skipped with motion off and on repeat visits
 * in the same tab session (it only plays once per session).
 */
export function startLoader({ reduced = false } = {}) {
  const root = document.getElementById('intro');
  const count = document.getElementById('introCount');
  const bar = document.getElementById('introBar');
  const started = performance.now();
  let seen = false;
  try { seen = sessionStorage.getItem('dp-intro') === '1'; sessionStorage.setItem('dp-intro', '1'); } catch { /* ignore */ }
  const skip = reduced || seen || !root;
  if (skip) root?.remove();

  let shown = 0;
  let target = 70; // creeps up while the scene loads
  let raf = 0;
  const tick = () => {
    shown += (target - shown) * 0.08 + 0.15;
    shown = Math.min(shown, target);
    if (count) count.textContent = String(Math.floor(shown)).padStart(2, '0');
    if (bar) bar.style.transform = `scaleX(${shown / 100})`;
    raf = requestAnimationFrame(tick);
  };
  if (!skip) raf = requestAnimationFrame(tick);

  /** Finish: count to 100, then lift the curtain. */
  async function finish({ minTime = 0.9 } = {}) {
    if (skip || !root?.isConnected) { cancelAnimationFrame(raf); root?.remove(); return; }
    const wait = Math.max(0, minTime * 1000 - (performance.now() - started));
    await new Promise((r) => setTimeout(r, wait));
    target = 100;
    await new Promise((r) => setTimeout(r, 420));
    cancelAnimationFrame(raf);
    if (count) count.textContent = '100';
    if (bar) bar.style.transform = 'scaleX(1)';
    root.classList.add('done');
    await new Promise((r) => setTimeout(r, 500));
    setTimeout(() => root.remove(), 600);
  }

  return { finish, skipped: skip };
}
