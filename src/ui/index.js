/**
 * Page UI that does not depend on WebGL. Runs on every device.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initIcons } from './icons.js';
import { initNav } from './nav.js';
import { initReveals } from './reveal.js';
import { initTilt } from './tilt.js';
import { initCareer } from './career.js';
import { initCloud } from './cloud.js';
import { initWorkflow } from './workflow.js';

gsap.registerPlugin(ScrollTrigger);

export function initUI({ reduced, mobile }) {
  initIcons();
  initNav();
  initReveals({ reduced });
  initTilt({ reduced, mobile });
  initCareer({ reduced });
  initCloud({ reduced, mobile });
  initWorkflow({ reduced });
  // Fonts can change heights after load; recalculate scroll positions once.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
