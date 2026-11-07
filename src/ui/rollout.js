/**
 * Kubernetes rolling update, drawn with plain HTML inside the k3s project popup.
 * Strategy: maxSurge 1, maxUnavailable 0. A new pod starts, becomes Ready,
 * then one old pod terminates, so Ready stays at 6/6 the whole time.
 * With motion off it shows the finished state. Returns a stop() function.
 */
import { motion } from './motion.js';

export function startRollout(root) {
  const podsEl = root.querySelector('[data-ro-pods]');
  const readyEl = root.querySelector('[data-ro-ready]');
  const msgEl = root.querySelector('[data-ro-msg]');
  const TOTAL = 6;
  let version = 1;
  let alive = true;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const hash = () => Math.random().toString(36).slice(2, 7);

  function pod(v, state = 'ready') {
    const el = document.createElement('div');
    el.className = `pod v${(v - 1) % 3} ${state}`;
    el.dataset.v = String(v);
    el.innerHTML = `<span class="pod-dot"></span><span class="pod-name">${hash()}</span><span class="pod-v">v${v}</span>`;
    return el;
  }
  const setReady = () => { readyEl.textContent = String(Math.min(TOTAL, podsEl.querySelectorAll('.pod.ready').length)); };

  podsEl.innerHTML = '';
  for (let i = 0; i < TOTAL; i++) podsEl.appendChild(pod(version));
  setReady();
  msgEl.textContent = 'deployment "enotary" successfully rolled out';

  async function rollout() {
    const next = version + 1;
    msgEl.textContent = `rolling out v${next} (maxSurge=1, maxUnavailable=0)`;
    for (let i = 0; i < TOTAL && alive; i++) {
      while (alive && !motion.on) await sleep(400);
      const fresh = pod(next, 'pending');
      podsEl.appendChild(fresh);
      await sleep(450);
      fresh.className = fresh.className.replace('pending', 'creating');
      await sleep(700);
      fresh.className = fresh.className.replace('creating', 'ready');
      setReady();
      const old = [...podsEl.querySelectorAll('.pod.ready')].find((p) => p.dataset.v !== String(next));
      if (old) {
        old.className = old.className.replace('ready', 'terminating');
        msgEl.textContent = `${i + 1} of ${TOTAL} updated replicas are available…`;
        await sleep(600);
        old.remove();
      }
      setReady();
      await sleep(250);
    }
    if (!alive) return;
    version = next;
    msgEl.textContent = 'deployment "enotary" successfully rolled out';
    root.classList.add('done');
    await sleep(2600);
    root.classList.remove('done');
  }

  (async () => {
    await sleep(700);
    while (alive) {
      if (!motion.on) { await sleep(400); continue; }
      await rollout();
    }
  })();

  return () => { alive = false; };
}
