// particleWave.js — Neon green DNA particle wave + CTA vortex
import * as THREE from 'three';
import { getSoftParticleSprite } from '../utils/pointSprite.js';

export function createParticleWave() {
  const count = 12000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const neon = new THREE.Color(0x00ff88);
  const deep = new THREE.Color(0x0a3d1f);
  const bright = new THREE.Color(0x44ffaa);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const t = i / count;

    const x = (t - 0.5) * 20;
    const waveY = Math.sin(t * Math.PI * 3.5) * 1.6;
    const waveZ = Math.cos(t * Math.PI * 2.5) * 0.9;

    const spread = 0.5;
    positions[i3] = x + (Math.random() - 0.5) * spread;
    positions[i3 + 1] = waveY + (Math.random() - 0.5) * spread * 1.4;
    positions[i3 + 2] = waveZ + (Math.random() - 0.5) * spread;

    const pick = Math.random();
    const color = pick > 0.55 ? neon.clone() : pick > 0.2 ? deep.clone() : bright.clone();
    color.lerp(neon, Math.random() * 0.2);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    map: getSoftParticleSprite(),
    size: 0.045,
    transparent: true,
    opacity: 0,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    alphaTest: 0.04,
  });

  const wave = new THREE.Points(geometry, material);
  wave.userData.basePositions = positions.slice();
  wave.visible = false;
  wave.position.set(0, 0, -3);
  wave.userData.mode = 'wave';

  return wave;
}

export function updateParticleWave(wave, time) {
  if (!wave.visible) return;

  const positions = wave.geometry.attributes.position.array;
  const base = wave.userData.basePositions;
  const count = positions.length / 3;

  if (wave.userData.mode === 'wave') {
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = i / count;
      positions[i3 + 1] = base[i3 + 1] + Math.sin(time * 0.7 + t * 10) * 0.18;
      positions[i3 + 2] = base[i3 + 2] + Math.cos(time * 0.5 + t * 7) * 0.1;
      positions[i3] = base[i3] + Math.sin(time * 0.25 + t * 5) * 0.04;
    }
  } else if (wave.userData.mode === 'vortex') {
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = i / count;

      const angle = t * Math.PI * 7 + time * 0.4;
      const radius = 0.8 + Math.sin(t * Math.PI * 2 + time * 0.25) * 1.8 + t * 3.5;
      const y = (t - 0.5) * 7 + Math.sin(time * 0.35 + t * 4) * 0.4;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(angle) * radius - 3;
    }
  }

  wave.geometry.attributes.position.needsUpdate = true;
  wave.rotation.y = Math.sin(time * 0.08) * 0.04;
}

export function setWaveMode(wave, mode) {
  if (wave) wave.userData.mode = mode;
}
