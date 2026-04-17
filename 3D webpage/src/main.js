// main.js — Green Space Herbs 3D Scene
import * as THREE from 'three';
import './style.css';

// Scene modules
import { createParticles, updateParticles } from './scene/particles.js';
import { createLotus, updateLotus } from './scene/lotus.js';
import { createGoldenDroplet, updateGoldenDroplet } from './scene/goldenDroplet.js';
import { createHelix, updateHelix } from './scene/helix.js';
import { createEnergySphere, updateEnergySphere } from './scene/energySphere.js';
import { createCrystalCluster, updateCrystalCluster } from './scene/crystalCluster.js';
import { createParticleWave, updateParticleWave } from './scene/particleWave.js';
import { createLightBeam } from './scene/transitions.js';
import { createParticleBurst } from './scene/transitions.js';
import { createGoldenSheet, updateGoldenSheet } from './scene/goldenSheet.js';

// Effects & Controls
import { createComposer } from './effects/postprocessing.js';
import { MouseParallax } from './controls/mouseParallax.js';
import { initScrollAnimations } from './controls/scrollAnimations.js';

// ============================
// Scene Setup
// ============================
const canvas = document.getElementById('webgl');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020a04, 0.025);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.3, 5.5);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ============================
// Lighting — neon green fusion
// ============================
const ambientLight = new THREE.AmbientLight(0x041a08, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x00ff88, 0.4);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0x00ff88, 0x020a04, 0.35);
scene.add(hemisphereLight);

// Subtle green ambient fill from below
const fillLight = new THREE.PointLight(0x00ff88, 0.6, 20);
fillLight.position.set(0, -5, 0);
scene.add(fillLight);

// ============================
// Create 3D Objects
// ============================
const particles = createParticles(6000);
scene.add(particles);

const lotus = createLotus();
scene.add(lotus);

const goldenDroplet = createGoldenDroplet();
scene.add(goldenDroplet);

const helix = createHelix();
scene.add(helix);

const energySphere = createEnergySphere();
scene.add(energySphere);

const crystalCluster = createCrystalCluster();
scene.add(crystalCluster);

const particleWave = createParticleWave();
scene.add(particleWave);

// Transition effects
const lightBeam = createLightBeam();
scene.add(lightBeam);

const particleBurst = createParticleBurst();
scene.add(particleBurst);

const goldenSheet = createGoldenSheet();
scene.add(goldenSheet);

// ============================
// Post-processing
// ============================
const { composer, bloom } = createComposer(renderer, scene, camera);

// ============================
// Mouse Parallax
// ============================
const mouseParallax = new MouseParallax(camera);

// ============================
// Scroll Animations
// ============================
initScrollAnimations({
  lotus,
  goldenDroplet,
  helix,
  energySphere,
  crystalCluster,
  particleWave,
  particles,
  camera,
  lightBeam,
  particleBurst,
  goldenSheet,
});

// ============================
// Animation Loop
// ============================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  updateParticles(particles, time);
  updateLotus(lotus, time);

  if (goldenDroplet.visible) updateGoldenDroplet(goldenDroplet, time);
  if (helix.visible) updateHelix(helix, time);
  if (energySphere.visible) updateEnergySphere(energySphere, time);
  if (crystalCluster.visible) updateCrystalCluster(crystalCluster, time);
  updateParticleWave(particleWave, time);
  updateGoldenSheet(goldenSheet, time);

  mouseParallax.update();
  composer.render();
}

animate();

// ============================
// Resize
// ============================
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
}

window.addEventListener('resize', onResize);

console.log('🌿 Green Space Herbs — Neon Botanical Scene initialized');
