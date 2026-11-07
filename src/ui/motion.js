/**
 * Site-wide motion setting.
 * Starts from the visitor's saved choice, else the system "reduce motion"
 * setting. The header button flips it and the choice is remembered.
 * Modules read `motion.on` when they run and can subscribe to changes.
 */
import { SITE } from '../data/site.js';

const KEY = `${SITE.storageKey}:motion`;
const listeners = new Set();

function initial() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved === 'on';
  } catch { /* storage blocked: fall back to the system setting */ }
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let on = initial();
document.documentElement.classList.toggle('motion-off', !on);

export const motion = {
  get on() { return on; },
  set(value) {
    if (value === on) return;
    on = value;
    document.documentElement.classList.toggle('motion-off', !on);
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* ignore */ }
    listeners.forEach((fn) => fn(on));
  },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
};

/** The header button: shows the state and flips it. */
export function initMotionButton() {
  const btn = document.getElementById('motionBtn');
  if (!btn) return;
  const paint = () => {
    btn.setAttribute('aria-pressed', String(on));
    btn.querySelector('.motion-lbl').innerHTML = `Motion <b>${on ? 'on' : 'off'}</b>`;
    btn.setAttribute('aria-label', on ? 'Motion is on. Turn animations off' : 'Motion is off. Turn animations on');
  };
  paint();
  btn.addEventListener('click', () => motion.set(!on));
  motion.subscribe(paint);
}
