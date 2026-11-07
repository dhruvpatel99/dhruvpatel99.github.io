/**
 * Small details that make the page feel alive:
 *  - scroll progress line under the top bar
 *  - magnetic buttons and a blend-mode cursor dot (mouse only)
 *  - endless tool marquee
 *  - a tiny toast helper
 * Everything checks the motion setting, so the header toggle stops it all.
 */
import { motion } from './motion.js';

export function toast(text) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2200);
}

function progress() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  };
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function magnetic() {
  document.querySelectorAll('.btn.primary, .pill.cta, .copy-btn').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      if (!motion.on) return;
      const r = el.getBoundingClientRect();
      el.style.translate = `${(e.clientX - (r.left + r.width / 2)) * 0.2}px ${(e.clientY - (r.top + r.height / 2)) * 0.3}px`;
    });
    el.addEventListener('pointerleave', () => { el.style.translate = ''; });
  });
}

function cursor() {
  const dot = document.getElementById('cursor');
  if (!dot) return;
  let x = -100; let y = -100; let cx = x; let cy = y; let raf = 0;
  const loop = () => {
    const k = motion.on ? 0.25 : 1;
    cx += (x - cx) * k; cy += (y - cy) * k;
    dot.style.transform = `translate(${cx}px, ${cy}px)`;
    raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : 0;
  };
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    dot.classList.add('on');
    dot.classList.toggle('hot', !!e.target.closest('a, button, [data-open], [role="option"]'));
    dot.classList.toggle('text', !!e.target.closest('input, textarea, .term-body'));
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  document.addEventListener('pointerleave', () => dot.classList.remove('on'));
  window.addEventListener('pointerdown', () => dot.classList.add('press'));
  window.addEventListener('pointerup', () => dot.classList.remove('press'));
}

function marquee() {
  const track = document.getElementById('marquee');
  if (!track) return;
  // Two copies side by side make the loop seamless.
  track.innerHTML += track.innerHTML;
}

export function initFx({ mobile }) {
  progress();
  marquee();
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !mobile) { magnetic(); cursor(); }
}
