/**
 * Entry point.
 * 1. Read the motion setting (saved choice or system setting).
 * 2. Start the intro curtain and the page UI (works with or without 3D).
 * 3. Build the 3D scene, then play the intro and hook up scrolling.
 * 4. The header Motion button can pause or resume everything later.
 */
import gsap from 'gsap';
import { startLoader } from './ui/loader.js';
import { initUI } from './ui/index.js';
import { motion } from './ui/motion.js';
import { INTRO } from './config.js';

const root = document.documentElement;
const reduced = !motion.on;
const mobile = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

async function boot() {
  const heroItems = document.querySelectorAll('[data-hero-item]');
  const loader = startLoader({ reduced });
  const ui = initUI({ reduced, mobile });
  const showHero = () => { gsap.set(heroItems, { autoAlpha: 1, y: 0, clearProps: 'transform' }); gsap.set('.hero-name .hn', { yPercent: 0 }); };

  if (!hasWebGL()) {
    // Clean 2D version: same content, static loop drawing in the hero.
    root.classList.add('no-webgl');
    await loader.finish({ minTime: 0.5 });
    if (!reduced) gsap.fromTo(heroItems, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07 });
    ui.projects.openFromHash();
    return;
  }

  root.classList.add('webgl');
  if (!reduced) { gsap.set(heroItems, { autoAlpha: 0 }); gsap.set('.hero-name .hn', { yPercent: 105 }); }

  let world;
  try {
    // Load the 3D code only once we know WebGL works (keeps the 2D path light).
    const [{ createScene }, intro, scroll] = await Promise.all([
      import('./scene/createScene.js'),
      import('./scene/intro.js'),
      import('./scene/scrollScene.js'),
    ]);
    world = createScene({ canvas: document.getElementById('scene'), mobile, reduced });
    world.renderOnce(); // compiles shaders behind the intro curtain

    await loader.finish({ minTime: INTRO.bootMin });

    let scrubbed = false;
    if (reduced) {
      intro.showFinalState(world, heroItems);
      scroll.connectStaticScroll(world);
    } else {
      world.startLoop();
      intro.playIntro(world, heroItems);
      scroll.connectScroll(world);
      scrubbed = true;
    }

    // Motion button: pause on a still frame or start again.
    let raf = 0;
    window.addEventListener('scroll', () => {
      if (world.motionOn || raf) return;
      raf = requestAnimationFrame(() => { raf = 0; world.renderOnce(); });
    }, { passive: true });
    motion.subscribe((on) => {
      if (!on) gsap.globalTimeline.getChildren(true, true, false).forEach((t) => { if (!t.scrollTrigger) t.progress(1); });
      showHero();
      world.setMotion(on);
      if (on && !scrubbed) { scroll.connectScroll(world); scrubbed = true; }
    });
  } catch (err) {
    console.warn('3D scene failed, showing the 2D version instead.', err);
    root.classList.remove('webgl');
    root.classList.add('no-webgl');
    showHero();
    world?.dispose();
    world = null;
    await loader.finish({ minTime: 0.2 });
  }

  ui.projects.openFromHash();

  // Free GPU memory when the page is really closed (not when it goes into the back/forward cache).
  window.addEventListener('pagehide', (e) => { if (!e.persisted) world?.dispose(); });
}

boot();
