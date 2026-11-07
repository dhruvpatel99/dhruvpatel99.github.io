/**
 * Scroll reveals: [data-reveal] blocks rise 32px and fade in, in small
 * batches, with the shared ease. Featured project cards also draw their
 * pipeline left to right. Nothing hides content when motion is off.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from './motion.js';

const EASE = 'expo.out'; // close to cubic-bezier(.22, 1, .36, 1)

export function initReveals() {
  const blocks = gsap.utils.toArray('[data-reveal]');
  if (!motion.on) return;

  gsap.set(blocks, { autoAlpha: 0, y: 32 });
  ScrollTrigger.batch(blocks, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.07, clearProps: 'transform,opacity,visibility' }),
  });

  // Section titles: each line slides up from behind a mask.
  gsap.utils.toArray('.sec-head h2, .talk').forEach((h) => {
    gsap.from(h, { yPercent: 40, autoAlpha: 0, duration: 1.1, ease: EASE, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });

  // If motion is switched off later, show everything that is still hidden.
  motion.subscribe((on) => {
    if (on) return;
    gsap.set('[data-reveal], .sec-head h2, .talk', { clearProps: 'all' });
  });
}
