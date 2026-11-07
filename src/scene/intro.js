/**
 * Intro timeline for the hero (times in seconds, see config INTRO).
 *
 *  0.00  camera starts far away (CAMERA.start) and pushes in      expo.out, 2.8s
 *  0.00  loop scales 0.72 -> 1 and unwinds its spin -0.9 -> 0      power3.out, 2.6s
 *  0.25  tube draws itself along its length                       power2.inOut, 1.9s
 *  1.10  stage nodes pop in one by one (Plan ... Monitor)         back.out(2.2), 0.5s, 0.08s apart
 *  1.00  the big name rises from behind its mask                    expo.out, 1.3s
 *  1.35  role, summary, buttons and numbers fade up               expo.out, 0.9s, 0.08s apart
 *  2.00  packets start travelling and lighting up the stages
 */
import gsap from 'gsap';
import { INTRO } from '../config.js';

export function playIntro(world, heroItems) {
  const { state, loop } = world;
  const draw = { p: 0 };
  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });

  tl.to(state, { intro: 1, duration: INTRO.flyIn, ease: 'expo.out' }, 0)
    .to(state, { introScale: 1, introSpin: 0, duration: INTRO.flyIn - 0.2, ease: 'power3.out' }, 0)
    .to(draw, { p: 1, duration: INTRO.draw, ease: 'power2.inOut', onUpdate: () => loop.setDraw(draw.p) }, INTRO.drawDelay)
    .to(loop.stages, { appear: 1, duration: 0.5, ease: 'back.out(2.2)', stagger: INTRO.nodeStagger }, INTRO.nodesAt)
    .fromTo('.hero-name .hn', { yPercent: 105 }, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.12 }, INTRO.textAt - 0.35)
    .fromTo(heroItems, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, clearProps: 'transform' }, INTRO.textAt)
    .call(() => loop.startPackets(), null, INTRO.packetsAt);
  return tl;
}

/** Reduced motion or no animation: show the finished state straight away. */
export function showFinalState(world, heroItems) {
  gsap.set(heroItems, { autoAlpha: 1, y: 0 });
  gsap.set('.hero-name .hn', { yPercent: 0 });
  if (!world) return;
  world.loop.setDraw(1);
  world.loop.stages.forEach((s) => { s.appear = 1; });
  world.loop.startPackets();
  world.renderOnce();
}
