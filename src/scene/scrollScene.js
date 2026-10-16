/**
 * Connects page scroll to the 3D scene with GSAP ScrollTrigger.
 *  - Hero: as you scroll past it, the loop shrinks, moves to a corner and
 *    fades into a backdrop (state.hero 0 -> 1).
 *  - Whole page: a slow drift of the camera and loop (state.page 0 -> 1),
 *    so each section is seen from a slightly different angle.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function connectScroll(world) {
  const { state } = world;
  // Tweens with `scrub` smooth out wheel steps, so the scene glides.
  gsap.to(state, {
    hero: 1,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
  });
  gsap.to(state, {
    page: 1,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.2 },
  });
}
