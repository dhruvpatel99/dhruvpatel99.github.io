/**
 * Page UI that does not depend on WebGL. Runs on every device.
 * Content is rendered from src/data first, then the behaviour is attached.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initMotionButton } from './motion.js';
import { renderContent } from './render.js';
import { initProjects } from './projects.js';
import { initNav } from './nav.js';
import { initMenu } from './menu.js';
import { initReveals } from './reveal.js';
import { initFx } from './fx.js';
import { initTerminal } from './terminal.js';
import { initDashboard, initCountUps } from './dashboard.js';
import { initPalette } from './palette.js';
import { initContact } from './contact.js';
import { initLive } from './live.js';

gsap.registerPlugin(ScrollTrigger);

export function initUI({ reduced, mobile }) {
  renderContent();
  const projects = initProjects();
  initMotionButton();
  initNav();
  initMenu();
  initReveals();
  initFx({ mobile });
  initCountUps();
  initDashboard();
  const terminal = initTerminal({ reduced });
  initPalette({ terminal });
  initContact();
  initLive();
  // Fonts can change heights after load; recalculate scroll positions once.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  return { projects };
}
