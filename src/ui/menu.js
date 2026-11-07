/**
 * Mobile menu: full-screen list of sections.
 * Opens from the round button, closes with Escape, a link, or the button.
 * Focus stays inside while it is open and returns to the button after.
 */
import { SECTIONS } from '../data/site.js';

export function initMenu() {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  const list = document.getElementById('menuList');
  if (!btn || !menu || !list) return;

  list.innerHTML = SECTIONS.map((s) => `<li><a href="#${s.id}">${s.label}</a></li>`).join('');

  const focusables = () => [btn, ...menu.querySelectorAll('a, button')];
  let open = false;

  function set(state) {
    open = state;
    btn.setAttribute('aria-expanded', String(open));
    btn.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('open'));
      setTimeout(() => list.querySelector('a')?.focus(), 80);
    } else {
      menu.classList.remove('open');
      setTimeout(() => { if (!open) menu.hidden = true; }, 600);
    }
  }

  btn.addEventListener('click', () => set(!open));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) set(false);
  });
  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); set(false); btn.focus(); }
    if (e.key === 'Tab') {
      const f = focusables();
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  // Close if the screen grows past the menu breakpoint.
  window.matchMedia('(min-width: 1101px)').addEventListener('change', (e) => { if (e.matches && open) set(false); });
}
