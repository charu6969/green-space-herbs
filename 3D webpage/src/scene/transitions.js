// transitions.js — Golden light beam & particle burst transitions between sections
import * as THREE from 'three';
import { getSoftParticleSprite } from '../utils/pointSprite.js';

// -----------------------------------------------------------------------------
// Golden Vertical Light Beam — appears between sections during scroll
// -----------------------------------------------------------------------------
export function createLightBeam() {
  const group = new THREE.Group();

  // Main beam — tall narrow emissive plane
  const beamGeo = new THREE.PlaneGeometry(0.3, 12, 1, 32);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffe8a0,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  group.add(beam);

  // Second beam — wider, softer glow
  const beam2Geo = new THREE.PlaneGeometry(1.2, 12, 1, 32);
  const beam2Mat = new THREE.MeshBasicMaterial({
    color: 0xd4a843,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beam2 = new THREE.Mesh(beam2Geo, beam2Mat);
  group.add(beam2);

  // Third beam — widest, subtlest
  const beam3Geo = new THREE.PlaneGeometry(3.0, 12, 1, 32);
  const beam3Mat = new THREE.MeshBasicMaterial({
    color: 0xd4a843,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beam3 = new THREE.Mesh(beam3Geo, beam3Mat);
  group.add(beam3);

  // Point light at the center for volumetric feel
  const beamLight = new THREE.PointLight(0xffd57a, 0, 8);
  group.add(beamLight);

  group.visible = false;
  group.userData.beamMaterials = [beamMat, beam2Mat, beam3Mat];
  group.userData.beamLight = beamLight;
  return group;
}

export function flashLightBeam(group, duration = 0.8) {
  if (!group) return;
  group.visible = true;
  const mats = group.userData.beamMaterials;
  const light = group.userData.beamLight;

  const maxOpacities = [0.7, 0.35, 0.12];
  const startTime = performance.now();

  function animateBeam() {
    const elapsed = (performance.now() - startTime) / 1000;
    const progress = Math.min(elapsed / duration, 1);

    // Bell curve: quick ramp up then fade
    const intensity = Math.sin(progress * Math.PI);

    mats.forEach((mat, i) => {
      mat.opacity = maxOpacities[i] * intensity;
    });
    light.intensity = 6 * intensity;

    // Add slight scale animation
    group.scale.x = 0.5 + intensity * 0.5;

    if (progress < 1) {
      requestAnimationFrame(animateBeam);
    } else {
      group.visible = false;
      mats.forEach(mat => mat.opacity = 0);
      light.intensity = 0;
      group.scale.x = 1;
    }
  }

  requestAnimationFrame(animateBeam);
}

// -----------------------------------------------------------------------------
// Golden Particle Burst — explosion of particles during transitions
// -----------------------------------------------------------------------------
export function createParticleBurst() {
  const count = 500;
  const positions = new Float32Array(count * 3);
  const velocities = [];
  const colors = new Float32Array(count * 3);

  const gold = new THREE.Color(0xffd57a);
  const brightGold = new THREE.Color(0xffe8a0);
  const white = new THREE.Color(0xfff8e4);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = 0;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = 0;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const speed = 0.5 + Math.random() * 3;

    velocities.push({
      x: speed * Math.sin(phi) * Math.cos(theta),
      y: speed * Math.sin(phi) * Math.sin(theta),
      z: speed * Math.cos(phi),
      decay: 0.94 + Math.random() * 0.04,
    });

    const pick = Math.random();
    const c = pick > 0.6 ? gold : pick > 0.3 ? brightGold : white;
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    map: getSoftParticleSprite(),
    size: 0.08,
    transparent: true,
    opacity: 0,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    alphaTest: 0.05,
  });

  const burst = new THREE.Points(geo, mat);
  burst.visible = false;
  burst.userData.velocities = velocities;
  burst.userData.material = mat;
  return burst;
}

export function triggerBurst(burst, position, duration = 1.2) {
  if (!burst) return;

  const positions = burst.geometry.attributes.position.array;
  const vels = burst.userData.velocities;
  const count = vels.length;

  // Reset all particles to center
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = 0;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = 0;
  }
  burst.geometry.attributes.position.needsUpdate = true;

  burst.position.copy(position);
  burst.visible = true;
  burst.userData.material.opacity = 0.9;

  const startTime = performance.now();

  function animateBurst() {
    const elapsed = (performance.now() - startTime) / 1000;
    const progress = Math.min(elapsed / duration, 1);

    // Fade opacity
    burst.userData.material.opacity = 0.9 * (1 - progress * progress);

    // Move particles outward
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const v = vels[i];
      const damping = Math.pow(v.decay, elapsed * 60);
      positions[i3] += v.x * damping * 0.016;
      positions[i3 + 1] += v.y * damping * 0.016;
      positions[i3 + 2] += v.z * damping * 0.016;
    }
    burst.geometry.attributes.position.needsUpdate = true;

    if (progress < 1) {
      requestAnimationFrame(animateBurst);
    } else {
      burst.visible = false;
      burst.userData.material.opacity = 0;
    }
  }

  requestAnimationFrame(animateBurst);
}

export function updateTransitions() {
  // placeholder for any continuous transition effects
}
