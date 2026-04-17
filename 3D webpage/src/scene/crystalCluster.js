// crystalCluster.js — Dark crystal cluster in golden wireframe sphere for Stage 03
import * as THREE from 'three';

export function createCrystalCluster() {
  const group = new THREE.Group();

  // Crystal cluster — multiple octahedrons/dodecahedrons
  const crystalCount = 12;
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    emissive: 0x0a0a15,
    emissiveIntensity: 0.2,
    metalness: 0.95,
    roughness: 0.05,
    flatShading: true,
  });

  for (let i = 0; i < crystalCount; i++) {
    const geoType = i % 3;
    let geo;
    if (geoType === 0) {
      geo = new THREE.OctahedronGeometry(0.2 + Math.random() * 0.2);
    } else if (geoType === 1) {
      geo = new THREE.TetrahedronGeometry(0.15 + Math.random() * 0.15);
    } else {
      geo = new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.12);
    }

    const crystal = new THREE.Mesh(geo, crystalMat.clone());

    // Golden edge highlight
    crystal.material.color.setHSL(0.08 + Math.random() * 0.03, 0.1, 0.1 + Math.random() * 0.1);

    const angle = (i / crystalCount) * Math.PI * 2;
    const r = Math.random() * 0.4;
    crystal.position.set(
      Math.cos(angle) * r,
      (Math.random() - 0.5) * 0.6,
      Math.sin(angle) * r
    );
    crystal.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    group.add(crystal);
  }

  // Golden wireframe sphere cage
  const cageGeo = new THREE.IcosahedronGeometry(1.2, 1);
  const cageMat = new THREE.MeshStandardMaterial({
    color: 0xd4a843,
    emissive: 0xd4a843,
    emissiveIntensity: 0.4,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
  });
  const cage = new THREE.Mesh(cageGeo, cageMat);
  group.add(cage);

  // Orbital rings around the sphere
  for (let i = 0; i < 2; i++) {
    const ringGeo = new THREE.TorusGeometry(1.5 + i * 0.3, 0.012, 16, 80);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      emissive: 0xd4a843,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.5 - i * 0.15,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3 + i * 0.5;
    ring.rotation.z = i * 0.6;
    ring.userData.rotSpeed = (0.4 + i * 0.2) * (i % 2 === 0 ? 1 : -1);
    group.add(ring);
  }

  // Grid lines on the wireframe sphere
  const gridSphereGeo = new THREE.SphereGeometry(1.3, 16, 16);
  const gridSphereMat = new THREE.MeshStandardMaterial({
    color: 0xd4a843,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const gridSphere = new THREE.Mesh(gridSphereGeo, gridSphereMat);
  group.add(gridSphere);

  // Point light
  const light = new THREE.PointLight(0xd4a843, 2, 5);
  group.add(light);

  group.visible = false;
  return group;
}

export function updateCrystalCluster(group, time) {
  group.rotation.y += 0.003;

  group.children.forEach((child) => {
    if (child.userData.rotSpeed) {
      child.rotation.z += child.userData.rotSpeed * 0.004;
    }
  });

  // Subtle pulse on cage
  const cage = group.children[12]; // After 12 crystals
  if (cage) {
    const s = 1 + Math.sin(time * 1.5) * 0.03;
    cage.scale.set(s, s, s);
  }
}
