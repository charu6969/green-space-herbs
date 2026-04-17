// energySphere.js — Golden energy burst with spiral rings for Stage 02
import * as THREE from 'three';

export function createEnergySphere() {
  const group = new THREE.Group();

  // Central bright sphere
  const coreGeo = new THREE.SphereGeometry(0.35, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xfff5d4,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Outer glow shell
  const glowGeo = new THREE.SphereGeometry(0.6, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xe8c555,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
  });
  const glowShell = new THREE.Mesh(glowGeo, glowMat);
  group.add(glowShell);

  // Point light
  const light = new THREE.PointLight(0xe8c555, 6, 10);
  group.add(light);

  // Particle burst (radial particles)
  const burstCount = 800;
  const burstPositions = new Float32Array(burstCount * 3);
  const burstVelocities = [];

  for (let i = 0; i < burstCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const r = 0.5 + Math.random() * 2.5;

    burstPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    burstPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    burstPositions[i * 3 + 2] = r * Math.cos(phi);

    burstVelocities.push({
      speed: Math.random() * 0.3 + 0.1,
      theta, phi
    });
  }

  const burstGeo = new THREE.BufferGeometry();
  burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));

  const burstMat = new THREE.PointsMaterial({
    color: 0xd4a843,
    size: 0.04,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const burst = new THREE.Points(burstGeo, burstMat);
  burst.userData.velocities = burstVelocities;
  group.add(burst);

  // Spiral rings
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(1.0 + i * 0.35, 0.012, 16, 80);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      emissive: 0xd4a843,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.5 - i * 0.1,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2 + (i - 1) * 0.6;
    ring.rotation.y = i * 0.5;
    ring.userData.rotSpeed = (0.3 + i * 0.2) * (i % 2 === 0 ? 1 : -1);
    group.add(ring);
  }

  group.visible = false;
  return group;
}

export function updateEnergySphere(group, time) {
  // Pulse the core
  const core = group.children[0];
  const scale = 1 + Math.sin(time * 2) * 0.1;
  core.scale.set(scale, scale, scale);

  // Rotate rings
  group.children.forEach((child) => {
    if (child.userData.rotSpeed) {
      child.rotation.z += child.userData.rotSpeed * 0.005;
    }
  });

  // Animate burst particles
  const burst = group.children[3]; // Points
  if (burst && burst.isPoints) {
    const positions = burst.geometry.attributes.position.array;
    const vels = burst.userData.velocities;
    for (let i = 0; i < vels.length; i++) {
      const i3 = i * 3;
      const r = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2);
      const pulse = Math.sin(time * vels[i].speed * 2 + i) * 0.01;
      const factor = 1 + pulse / r;
      positions[i3] *= factor;
      positions[i3 + 1] *= factor;
      positions[i3 + 2] *= factor;

      // Reset particles that go too far
      if (r > 3.5) {
        const newR = 0.5 + Math.random() * 0.5;
        positions[i3] = newR * Math.sin(vels[i].phi) * Math.cos(vels[i].theta);
        positions[i3 + 1] = newR * Math.sin(vels[i].phi) * Math.sin(vels[i].theta);
        positions[i3 + 2] = newR * Math.cos(vels[i].phi);
      }
    }
    burst.geometry.attributes.position.needsUpdate = true;
  }
}
