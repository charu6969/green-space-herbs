// goldenDroplet.js — Golden teardrop/egg with atom orbits for Stage 01
import * as THREE from 'three';

export function createGoldenDroplet() {
  const group = new THREE.Group();

  // Main droplet body (elongated sphere)
  const dropletGeo = new THREE.SphereGeometry(0.6, 32, 32);
  const dropletMat = new THREE.MeshStandardMaterial({
    color: 0xd4a843,
    emissive: 0xe8c555,
    emissiveIntensity: 0.8,
    metalness: 0.9,
    roughness: 0.15,
  });
  const droplet = new THREE.Mesh(dropletGeo, dropletMat);
  droplet.scale.set(0.8, 1.2, 0.8);
  group.add(droplet);

  // Top point (teardrop tip)
  const tipGeo = new THREE.ConeGeometry(0.25, 0.8, 16);
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0xe8c555,
    emissive: 0xe8c555,
    emissiveIntensity: 1.0,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
  });
  const tip = new THREE.Mesh(tipGeo, tipMat);
  tip.position.y = 0.95;
  group.add(tip);

  // Core glow
  const coreLight = new THREE.PointLight(0xe8c555, 4, 6);
  coreLight.position.y = 0;
  group.add(coreLight);

  // Inner glow sphere
  const glowGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  group.add(glow);

  // Orbital rings (atom-like)
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(1.2 + i * 0.3, 0.01, 16, 80);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      emissive: 0xd4a843,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.6 - i * 0.12,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2 + (i - 1) * 0.5;
    ring.rotation.z = i * 0.4;
    ring.userData.speed = (0.4 + i * 0.2) * (i % 2 === 0 ? 1 : -1);
    group.add(ring);
  }

  // Small orbiting spheres
  for (let i = 0; i < 4; i++) {
    const orbGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xe8c555,
      emissive: 0xe8c555,
      emissiveIntensity: 1.2,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.userData.orbitAngle = (i / 4) * Math.PI * 2;
    orb.userData.orbitRadius = 1.3 + i * 0.2;
    orb.userData.orbitSpeed = 0.6 + i * 0.15;
    orb.userData.orbitTilt = (i - 1.5) * 0.4;
    group.add(orb);
  }

  group.visible = false;
  return group;
}

export function updateGoldenDroplet(group, time) {
  // Rotate rings
  group.children.forEach((child) => {
    if (child.userData.speed) {
      child.rotation.z += child.userData.speed * 0.004;
    }
    if (child.userData.orbitAngle !== undefined) {
      const a = child.userData.orbitAngle + time * child.userData.orbitSpeed;
      const r = child.userData.orbitRadius;
      child.position.x = Math.cos(a) * r;
      child.position.y = Math.sin(a) * r * 0.4 + child.userData.orbitTilt;
      child.position.z = Math.sin(a) * r * 0.6;
    }
  });

  // Gentle hover
  group.position.y += Math.sin(time * 0.8) * 0.001;
}
