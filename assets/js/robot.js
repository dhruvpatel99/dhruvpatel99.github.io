/* ops-agent: a small procedural 3D robot for the hero.
   Built from primitive shapes (no model files), rendered with three.js.
   - idles: floats, blinks, breathes light on the chest and antenna
   - follows the pointer with head, eyes and body
   - reacts to scroll by turning towards the page
   - waves when clicked (event "agent:poke" from main.js)
   Renders only while visible, pauses in background tabs, and draws a single
   still frame when the visitor prefers reduced motion. */
import * as THREE from "three";
import { RoundedBoxGeometry } from "../vendor/three/RoundedBoxGeometry.js";
import { RoomEnvironment } from "../vendor/three/RoomEnvironment.js";

const stage = document.getElementById("agentStage");
const canvas = document.getElementById("agentCanvas");

if (stage && canvas) {
  try {
    boot();
  } catch (err) {
    stage.classList.add("no-3d");
    console.warn("ops-agent: 3D view unavailable", err);
  }
}

function boot() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CYAN = 0x3fd8f5;

  /* ---------- Renderer, scene, camera ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0.75, 9.2);
  camera.lookAt(0, 0.35, 0);

  scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x0a0e14, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 6);
  scene.add(key);
  const rim = new THREE.PointLight(CYAN, 14, 12, 2);
  rim.position.set(-2.4, 2.2, -2.2);
  scene.add(rim);
  const rim2 = new THREE.PointLight(0x5b8cff, 8, 12, 2);
  rim2.position.set(2.6, -0.4, -2);
  scene.add(rim2);

  /* ---------- Materials ---------- */
  const shell = new THREE.MeshPhysicalMaterial({ color: 0xd3dae3, roughness: 0.3, metalness: 0.12, clearcoat: 0.9, clearcoatRoughness: 0.18 });
  const graphite = new THREE.MeshPhysicalMaterial({ color: 0x1c222b, roughness: 0.38, metalness: 0.7 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x04070c, roughness: 0.06, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 });
  const light = new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false });
  const lightSoft = new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false, transparent: true, opacity: 0.85 });

  // Soft glow texture used for eye halos and the floor light.
  const glowTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.25, "rgba(255,255,255,0.45)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const glowMat = (opacity) => new THREE.SpriteMaterial({ map: glowTex, color: CYAN, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const mesh = (geo, mat) => new THREE.Mesh(geo, mat);

  /* ---------- Robot ---------- */
  const robot = new THREE.Group();
  scene.add(robot);
  const body = new THREE.Group();
  robot.add(body);

  // Torso
  const profile = [
    [0, 0.8], [0.2, 0.79], [0.42, 0.74], [0.56, 0.62], [0.61, 0.42], [0.57, 0.16],
    [0.47, -0.12], [0.37, -0.36], [0.32, -0.46], [0.3, -0.5], [0, -0.5]
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const torso = mesh(new THREE.LatheGeometry(profile, 48), shell);
  torso.scale.set(1, 1, 0.66);
  body.add(torso);
  const waist = mesh(new THREE.CylinderGeometry(0.285, 0.24, 0.14, 32), graphite);
  waist.scale.z = 0.8;
  waist.position.y = -0.585;
  body.add(waist);
  const pelvis = mesh(new THREE.SphereGeometry(0.27, 32, 20), shell);
  pelvis.scale.set(1, 0.62, 0.8);
  pelvis.position.y = -0.7;
  body.add(pelvis);
  const thruster = new THREE.Sprite(glowMat(0.7));
  thruster.position.y = -0.95;
  thruster.scale.set(0.5, 0.32, 1);
  body.add(thruster);

  // Chest panel with status ring
  const panel = mesh(new RoundedBoxGeometry(0.56, 0.32, 0.1, 4, 0.05), glass);
  panel.position.set(0, 0.36, 0.355);
  panel.rotation.x = -0.12;
  body.add(panel);
  const ring = mesh(new THREE.TorusGeometry(0.07, 0.014, 12, 48), light);
  ring.position.set(-0.13, 0.36, 0.41);
  ring.rotation.x = -0.12;
  body.add(ring);
  const bars = [];
  for (let i = 0; i < 3; i++) {
    const bar = mesh(new THREE.BoxGeometry(0.15 - i * 0.03, 0.018, 0.01), lightSoft.clone());
    bar.position.set(0.09 - i * 0.015, 0.41 - i * 0.05, 0.41 - i * 0.006);
    bar.rotation.x = -0.12;
    body.add(bar);
    bars.push(bar);
  }
  // Thin light seam down the chest
  const seam = mesh(new THREE.BoxGeometry(0.012, 0.42, 0.01), lightSoft);
  seam.position.set(0, -0.08, 0.36);
  seam.rotation.x = 0.28;
  body.add(seam);

  // Shoulders and arms (pivot at the shoulder, second pivot at the elbow)
  function makeArm(side) {
    const shoulder = new THREE.Group();
    shoulder.position.set(0.7 * side, 0.5, 0);
    shoulder.add(mesh(new THREE.SphereGeometry(0.14, 24, 16), graphite));
    const plate = mesh(new RoundedBoxGeometry(0.34, 0.16, 0.36, 4, 0.07), shell);
    plate.position.set(0.04 * side, 0.08, 0);
    plate.rotation.z = -0.35 * side;
    shoulder.add(plate);
    const upper = mesh(new THREE.CapsuleGeometry(0.09, 0.32, 6, 20), shell);
    upper.position.y = -0.3;
    shoulder.add(upper);
    const elbow = new THREE.Group();
    elbow.position.y = -0.55;
    elbow.add(mesh(new THREE.SphereGeometry(0.08, 20, 14), graphite));
    const fore = mesh(new THREE.CapsuleGeometry(0.085, 0.26, 6, 20), shell);
    fore.position.y = -0.22;
    elbow.add(fore);
    const cuff = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 24), lightSoft);
    cuff.position.y = -0.36;
    elbow.add(cuff);
    const hand = mesh(new RoundedBoxGeometry(0.17, 0.2, 0.12, 3, 0.05), graphite);
    hand.position.y = -0.48;
    elbow.add(hand);
    shoulder.add(elbow);
    shoulder.rotation.z = 0.12 * side;
    body.add(shoulder);
    return { shoulder, elbow };
  }
  const armL = makeArm(-1);
  const armR = makeArm(1);

  // Neck and head (head pivots at the neck)
  const neck = mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.24, 24), graphite);
  neck.position.y = 0.88;
  body.add(neck);
  const head = new THREE.Group();
  head.position.y = 0.98;
  body.add(head);

  const skull = mesh(new RoundedBoxGeometry(1.2, 0.78, 0.9, 6, 0.26), shell);
  skull.position.y = 0.42;
  head.add(skull);
  const crest = mesh(new RoundedBoxGeometry(0.22, 0.12, 0.7, 3, 0.05), graphite);
  crest.position.set(0, 0.82, -0.02);
  head.add(crest);
  const visor = mesh(new RoundedBoxGeometry(1.06, 0.38, 0.2, 6, 0.12), glass);
  visor.position.set(0, 0.44, 0.38);
  head.add(visor);
  const chin = mesh(new THREE.BoxGeometry(0.42, 0.014, 0.01), lightSoft);
  chin.position.set(0, 0.13, 0.452);
  head.add(chin);

  const eyes = new THREE.Group();
  eyes.position.set(0, 0.45, 0.49);
  head.add(eyes);
  const eyeGeo = new THREE.CapsuleGeometry(0.042, 0.17, 6, 16);
  const eyeL = mesh(eyeGeo, light);
  const eyeR = mesh(eyeGeo, light);
  [eyeL, eyeR].forEach((e, i) => { e.rotation.z = Math.PI / 2; e.position.x = i ? 0.23 : -0.23; eyes.add(e); });
  const haloL = new THREE.Sprite(glowMat(0.55));
  const haloR = new THREE.Sprite(glowMat(0.55));
  [haloL, haloR].forEach((h, i) => { h.position.set(i ? 0.23 : -0.23, 0, 0.03); h.scale.setScalar(0.5); eyes.add(h); });

  // Ear pods
  [-1, 1].forEach((side) => {
    const pod = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32), graphite);
    pod.rotation.z = Math.PI / 2;
    pod.position.set(0.63 * side, 0.42, -0.02);
    head.add(pod);
    const band = mesh(new THREE.TorusGeometry(0.1, 0.012, 10, 40), lightSoft);
    band.rotation.y = Math.PI / 2;
    band.position.set(0.685 * side, 0.42, -0.02);
    head.add(band);
  });

  // Antenna
  const stalk = mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.34, 12), graphite);
  stalk.position.set(0.34, 0.95, -0.1);
  stalk.rotation.z = -0.18;
  head.add(stalk);
  const tip = mesh(new THREE.SphereGeometry(0.045, 16, 12), light);
  tip.position.set(0.37, 1.12, -0.1);
  head.add(tip);
  const tipGlow = new THREE.Sprite(glowMat(0.6));
  tipGlow.position.copy(tip.position);
  tipGlow.scale.setScalar(0.34);
  head.add(tipGlow);

  // Hover base: two rings and a floor light
  const base = new THREE.Group();
  base.position.y = -1.45;
  scene.add(base);
  const ringA = mesh(new THREE.TorusGeometry(0.95, 0.012, 8, 96), lightSoft.clone());
  ringA.rotation.x = Math.PI / 2;
  base.add(ringA);
  const ringB = mesh(new THREE.TorusGeometry(0.68, 0.008, 8, 96), lightSoft.clone());
  ringB.material.opacity = 0.45;
  ringB.rotation.x = Math.PI / 2;
  base.add(ringB);
  const floor = mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: glowTex, color: CYAN, transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  base.add(floor);

  /* ---------- Input ---------- */
  const pointer = { x: 0, y: 0 };      // -1..1 across the window
  const look = { x: 0, y: 0 };         // smoothed
  let scrollP = 0, scrollSmooth = 0;
  let hover = false;

  window.addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    // Look a little harder towards the pointer when it is near the robot.
    const r = stage.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * 0.42;
    pointer.x = THREE.MathUtils.clamp(pointer.x * 0.6 + ((e.clientX - cx) / r.width) * 0.8, -1, 1);
    pointer.y = THREE.MathUtils.clamp(pointer.y * 0.5 + ((e.clientY - cy) / r.height) * 0.8, -1, 1);
    if (reduce) requestFrame();
  }, { passive: true });
  stage.addEventListener("pointerenter", () => { hover = true; });
  stage.addEventListener("pointerleave", () => { hover = false; });

  function readScroll() {
    const r = stage.getBoundingClientRect();
    scrollP = THREE.MathUtils.clamp(-r.top / Math.max(r.height, 1), 0, 1);
  }
  window.addEventListener("scroll", () => { readScroll(); if (reduce) requestFrame(); }, { passive: true });
  readScroll();

  // Wave when clicked.
  let waveStart = -1;
  stage.addEventListener("agent:poke", () => { waveStart = clock.getElapsedTime(); if (reduce) requestFrame(); });

  /* ---------- Size ---------- */
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull the camera back a little on tall, narrow stages so the robot fits.
    camera.position.z = camera.aspect < 0.95 ? 9.2 / Math.max(camera.aspect, 0.7) : 9.2;
    camera.lookAt(0, w < 480 ? -0.15 : 0.02, 0);
    camera.updateProjectionMatrix();
    requestFrame();
  }
  new ResizeObserver(resize).observe(stage);

  /* ---------- Animation ---------- */
  const clock = new THREE.Clock();
  let nextBlink = 2.5, blinkUntil = 0;

  function pose(t, dt) {
    const k = reduce ? 1 : 1 - Math.pow(0.0015, dt);  // frame-rate independent smoothing
    look.x += (pointer.x - look.x) * k;
    look.y += (pointer.y - look.y) * k;
    scrollSmooth += (scrollP - scrollSmooth) * k;
    const idle = reduce ? 0 : 1;

    // Float
    robot.position.y = idle * Math.sin(t * 1.3) * 0.07 - scrollSmooth * 0.25;
    floor.material.opacity = 0.26 - idle * Math.sin(t * 1.3) * 0.05;
    ringA.rotation.z = t * 0.25 * idle;
    ringB.rotation.z = -t * 0.4 * idle;
    ringA.material.opacity = 0.7 + idle * Math.sin(t * 2) * 0.15;

    // Body and head follow the pointer; scrolling turns the robot towards the page.
    body.rotation.y = look.x * 0.28 + idle * Math.sin(t * 0.45) * 0.05 - scrollSmooth * 0.5;
    body.rotation.x = look.y * 0.06 + scrollSmooth * 0.12;
    head.rotation.y = look.x * 0.5;
    head.rotation.x = look.y * 0.3 + scrollSmooth * 0.2;
    head.rotation.z = -look.x * 0.06;
    eyes.position.x = look.x * 0.07;
    eyes.position.y = 0.45 - look.y * 0.04;
    thruster.material.opacity = 0.55 + idle * Math.sin(t * 5) * 0.12;

    // Blink
    if (!reduce && t > nextBlink) { blinkUntil = t + 0.12; nextBlink = t + 2.6 + Math.random() * 3.2; }
    const eyeScale = t < blinkUntil ? 0.12 : 1;
    eyeL.scale.x = eyeR.scale.x = eyeScale;   // capsules are rotated, so x is their height
    const glow = hover ? 0.66 : 0.5;
    haloL.scale.setScalar(glow * (t < blinkUntil ? 0.3 : 1));
    haloR.scale.copy(haloL.scale);

    // Chest and antenna lights breathe
    const breathe = 0.5 + 0.5 * Math.sin(t * 2.2);
    ring.scale.setScalar(1 + idle * breathe * 0.12);
    bars.forEach((b, i) => { b.material.opacity = 0.35 + idle * 0.55 * (0.5 + 0.5 * Math.sin(t * 3 - i * 0.9)); });
    tipGlow.material.opacity = 0.35 + idle * breathe * 0.45;

    // Arms: gentle sway, or a wave after a click
    armL.shoulder.rotation.x = idle * Math.sin(t * 1.3 + 0.6) * 0.06;
    armL.elbow.rotation.x = -0.08;
    const w = waveStart >= 0 ? t - waveStart : -1;
    if (w >= 0 && w < 1.8) {
      const up = Math.min(w / 0.3, 1) * Math.min((1.8 - w) / 0.3, 1);
      armR.shoulder.rotation.z = 0.12 + up * 2.3;
      armR.shoulder.rotation.x = -up * 0.15;
      armR.elbow.rotation.z = up * (0.35 + Math.sin(w * 14) * 0.35);
      head.rotation.z += up * 0.08;
    } else {
      armR.shoulder.rotation.z = 0.12;
      armR.shoulder.rotation.x = idle * Math.sin(t * 1.3) * 0.06;
      armR.elbow.rotation.z = 0;
      armR.elbow.rotation.x = -0.08;
      if (w >= 1.8) waveStart = -1;
    }
    return w >= 0 && w < 1.8;
  }

  /* ---------- Render loop: only when visible ---------- */
  let visible = true, running = false, rafId = 0, framePending = false, firstFrame = true;

  function render() {
    renderer.render(scene, camera);
    if (firstFrame) { firstFrame = false; stage.classList.add("ready"); }
  }
  function loop() {
    rafId = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    pose(clock.getElapsedTime(), dt);
    render();
  }
  function start() {
    if (running || reduce) return;
    running = true;
    clock.getDelta();
    loop();
  }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  // Reduced motion: draw single frames on demand (pointer, scroll, resize, click).
  function requestFrame() {
    if (running) return;
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(() => {
      framePending = false;
      const t = clock.getElapsedTime();
      const waving = pose(t, 1);
      render();
      if (waving && reduce) requestFrame();
    });
  }

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && !document.hidden) start(); else stop();
  }, { threshold: 0.01 }).observe(stage);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop(); else if (visible) start();
  });

  resize();
  if (reduce) requestFrame(); else start();
}
