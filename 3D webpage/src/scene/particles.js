import * as THREE from 'three';
import { getSoftParticleSprite } from '../utils/pointSprite.js';

export function createParticles(count = 6000) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const speeds = new Float32Array(count);

  const neonGreen = new THREE.Color(0x00ff88);
  const dimGreen = new THREE.Color(0x0a3d1f);
  const softWhite = new THREE.Color(0xaaffcc);
  const deepGreen = new THREE.Color(0x15a050);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Wider, deeper cosmic distribution
    const r = Math.random() * 28 + 1.5;
    const theta = Math.random() * Math.PI * 2;
    const h = (Math.random() - 0.5) * 70;

    positions[i3] = Math.cos(theta) * r + (Math.random() - 0.5) * 10;
    positions[i3 + 1] = h;
    positions[i3 + 2] = Math.sin(theta) * r + (Math.random() - 0.5) * 18;

    const pick = Math.random();
    const color = pick > 0.55 ? neonGreen : pick > 0.3 ? dimGreen : pick > 0.12 ? deepGreen : softWhite;
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    speeds[i] = Math.random() * 0.4 + 0.12;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    map: getSoftParticleSprite(),
    size: 0.055,
    transparent: true,
    opacity: 0.7,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    alphaTest: 0.05,
  });

  const points = new THREE.Points(geometry, material);
  points.userData.speeds = speeds;
  points.userData.baseColors = colors.slice();
  points.userData.basePositions = positions.slice();

  return points;
}

export function updateParticles(particles, time) {
  const positions = particles.geometry.attributes.position.array;
  const speeds = particles.userData.speeds;
  const count = positions.length / 3;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Gentle cosmic float
    positions[i3 + 1] += Math.sin(time * speeds[i] + i) * 0.002;
    positions[i3] += Math.cos(time * speeds[i] * 0.7 + i * 0.5) * 0.001;
    positions[i3 + 2] += Math.sin(time * speeds[i] * 0.4 + i * 0.3) * 0.0008;
  }

  particles.geometry.attributes.position.needsUpdate = true;
  particles.rotation.y = time * 0.006;
}

// Color shifting based on scroll position
export function shiftParticleColors(particles, scrollProgress) {
  const colors = particles.geometry.attributes.color.array;
  const base = particles.userData.baseColors;
  const count = colors.length / 3;

  const goldColor = new THREE.Color(0xd4a843);

  // Subtle gold tint during middle sections
  let blendToGold;
  if (scrollProgress < 0.3) {
    blendToGold = scrollProgress / 0.3 * 0.25;
  } else if (scrollProgress < 0.7) {
    blendToGold = 0.25;
  } else {
    blendToGold = 0.25 * (1 - (scrollProgress - 0.7) / 0.3);
  }

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    colors[i3] = base[i3] + (goldColor.r - base[i3]) * blendToGold * 0.2;
    colors[i3 + 1] = base[i3 + 1] + (goldColor.g - base[i3 + 1]) * blendToGold * 0.2;
    colors[i3 + 2] = base[i3 + 2] + (goldColor.b - base[i3 + 2]) * blendToGold * 0.2;
  }

  particles.geometry.attributes.color.needsUpdate = true;
}
