// rings.js — Clean neon orbital ring with smooth rotation
import * as THREE from 'three';

export function createOrbitalRings(count = 1, baseRadius = 1.5, color = 0x00ff88) {
  const group = new THREE.Group();

  for (let i = 0; i < count; i++) {
    const radius = baseRadius + i * 0.4;

    // Main thin bright ring
    const geo = new THREE.TorusGeometry(radius, 0.006, 12, 256);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.85 - i * 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const ring = new THREE.Mesh(geo, mat);
    // Tilted orbit for the antigravity look
    ring.rotation.x = Math.PI / 2 + 0.15;
    ring.rotation.z = 0.08;

    ring.userData.speed = 0.18 * (i % 2 === 0 ? 1 : -1);
    group.add(ring);

    // Soft glow halo around the ring
    const glowGeo = new THREE.TorusGeometry(radius, 0.045, 12, 256);
    const glowMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.08 - i * 0.02,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowRing = new THREE.Mesh(glowGeo, glowMat);
    glowRing.rotation.copy(ring.rotation);
    glowRing.userData.speed = ring.userData.speed;
    group.add(glowRing);
  }

  return group;
}

export function updateRings(rings, time) {
  for (const child of rings.children) {
    // Smooth continuous rotation
    child.rotation.z += child.userData.speed * 0.002;
  }
}
