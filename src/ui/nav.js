/**
 * Header: marks the section you are reading, slides the red underline
 * to it, and gives the bar a background once you scroll.
 */
export function initNav() {
  const bar = document.getElementById('topbar');
  const links = [...document.querySelectorAll('#navList a[data-sec]')];
  const ink = document.getElementById('navInk');
  const sections = links.map((a) => document.getElementById(a.dataset.sec));
  let current = -2;

  function moveInk() {
    if (!ink) return;
    const a = links[current];
    if (!a || a.offsetParent === null) { ink.style.opacity = '0'; return; }
    ink.style.opacity = '1';
    ink.style.width = `${a.offsetWidth - 24}px`;
    ink.style.transform = `translateX(${a.offsetLeft + 12}px)`;
  }

  function update() {
    bar?.classList.toggle('scrolled', window.scrollY > 24);
    const mark = window.scrollY + window.innerHeight * 0.35;
    let now = -1;
    sections.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top + window.scrollY <= mark) now = i; });
    const contact = document.getElementById('contact');
    if (contact && contact.getBoundingClientRect().top < window.innerHeight * 0.5) now = -1;
    if (now === current) return;
    current = now;
    links.forEach((a, i) => {
      if (i === current) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    moveInk();
  }
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', () => { moveInk(); update(); });
  document.fonts?.ready.then(moveInk);
  update();
}
