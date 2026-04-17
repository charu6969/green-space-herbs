// helix.js — DNA double helix with lotus base
import * as THREE from 'three';

export function createHelix() {
  const group = new THREE.Group();

  const helixHeight = 4;
  const turns = 2.5;
  const radius = 0.5;
  const nodesPerStrand = 80;

  const greenColor = new THREE.Color(0x4ade80);
  const goldColor = new THREE.Color(0xd4a843);

  // Create two strands
  for (let strand = 0; strand < 2; strand++) {
    const offset = strand * Math.PI;

    for (let i = 0; i < nodesPerStrand; i++) {
      const t = i / nodesPerStrand;
      const angle = t * Math.PI * 2 * turns + offset;
      const y = t * helixHeight - helixHeight / 2;

      // Node sphere
      const nodeGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const color = greenColor.clone().lerp(goldColor, t);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9,
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );
      group.add(node);

      // Cross-links every 5 nodes
      if (i % 5 === 0 && strand === 0) {
        const otherAngle = angle + Math.PI;
        const points = [
          new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius),
          new THREE.Vector3(Math.cos(otherAngle) * radius, y, Math.sin(otherAngle) * radius),
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0xd4a843,
          transparent: true,
          opacity: 0.3,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);
      }
    }
  }

  // Central glow
  const glowGeo = new THREE.SphereGeometry(0.2, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x4ade80,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.y = -helixHeight / 2;
  group.add(glow);

  // Light
  const light = new THREE.PointLight(0x4ade80, 2, 5);
  light.position.y = 0;
  group.add(light);

  // Orbital ring around helix
  const ringGeo = new THREE.TorusGeometry(1.2, 0.015, 16, 80);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xd4a843,
    emissive: 0xd4a843,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.5,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  group.visible = false;
  return group;
}

export function updateHelix(helix, time) {
  helix.rotation.y += 0.005;
  // Ring rotation
  const ring = helix.children[helix.children.length - 1];
  if (ring) {
    ring.rotation.z = time * 0.3;
  }
}
