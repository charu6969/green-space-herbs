// goldenSheet.js — Animated golden metallic sheet/scroll that unfurls between stages
import * as THREE from 'three';

// Creates a golden metallic sheet that curls and unfurls
export function createGoldenSheet() {
  const group = new THREE.Group();

  const segmentsX = 64;
  const segmentsY = 48;
  const width = 5;
  const height = 3.5;

  const geometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xd4a843,
    emissive: 0x8b6914,
    emissiveIntensity: 0.6,
    metalness: 0.95,
    roughness: 0.12,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });

  const sheet = new THREE.Mesh(geometry, material);
  group.add(sheet);

  // Golden edge glow
  const edgeGeo = new THREE.EdgesGeometry(geometry, 15);
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xffe8a0,
    transparent: true,
    opacity: 0,
    linewidth: 1,
  });
  const edges = new THREE.LineSegments(edgeGeo, edgeMat);
  group.add(edges);

  // Grid lines on the sheet for that golden grid effect
  const gridGeo = new THREE.PlaneGeometry(width, height, 12, 8);
  const gridMat = new THREE.MeshBasicMaterial({
    color: 0xffe8a0,
    wireframe: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const grid = new THREE.Mesh(gridGeo, gridMat);
  grid.position.z = 0.01;
  group.add(grid);

  // Corner light flare
  const flareGeo = new THREE.SphereGeometry(0.15, 16, 16);
  const flareMat = new THREE.MeshBasicMaterial({
    color: 0xfff0a0,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const flare = new THREE.Mesh(flareGeo, flareMat);
  flare.position.set(-width / 2, -height / 2, 0.1);
  flare.scale.set(2, 2, 1);
  group.add(flare);

  // Point light for the flare
  const flareLight = new THREE.PointLight(0xffe8a0, 0, 5);
  flareLight.position.copy(flare.position);
  group.add(flareLight);

  group.visible = false;

  group.userData.sheet = sheet;
  group.userData.edges = edges;
  group.userData.grid = grid;
  group.userData.flare = flare;
  group.userData.flareLight = flareLight;
  group.userData.basePositions = geometry.attributes.position.array.slice();
  group.userData.width = width;
  group.userData.height = height;
  group.userData.curlProgress = 0;

  return group;
}

// Animate the sheet unfurling with curl
export function updateGoldenSheet(group, time) {
  if (!group.visible) return;

  const sheet = group.userData.sheet;
  const positions = sheet.geometry.attributes.position.array;
  const base = group.userData.basePositions;
  const curl = group.userData.curlProgress; // 0 = fully curled, 1 = fully flat
  const count = positions.length / 3;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const x = base[i3];
    const y = base[i3 + 1];

    // Normalize x to 0-1
    const nx = (x / group.userData.width) + 0.5;

    // Curl effect: vertices with higher nx curl into a cylinder
    const curlThreshold = curl; // unfurl from left to right
    if (nx > curlThreshold) {
      const curlAmount = (nx - curlThreshold) / (1 - curlThreshold + 0.001);
      const angle = curlAmount * Math.PI * 2.5; // curl amount
      const radius = 0.4 + curlAmount * 0.3;

      positions[i3] = base[i3] - curlAmount * 0.5; // shift left
      positions[i3 + 2] = Math.sin(angle) * radius * (1 - curl);
      positions[i3 + 1] = y + Math.cos(angle) * radius * 0.3 * (1 - curl);
    } else {
      positions[i3] = base[i3];
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(time * 1.5 + x * 2) * 0.02 * curl; // subtle wave when flat
    }
  }

  sheet.geometry.attributes.position.needsUpdate = true;
  sheet.geometry.computeVertexNormals();

  // Flare follows the curl edge
  const flare = group.userData.flare;
  const flareLight = group.userData.flareLight;
  const flareX = (curl - 0.5) * group.userData.width;
  flare.position.x = flareX;
  flareLight.position.x = flareX;

  const flareIntensity = Math.sin(curl * Math.PI);
  flare.material.opacity = flareIntensity * 0.8;
  flareLight.intensity = flareIntensity * 4;
  flare.scale.setScalar(1.5 + flareIntensity * 1.5);
}

// Animate unfurl
export function unfurlSheet(group, duration = 1.5) {
  if (!group) return;

  group.visible = true;
  const sheet = group.userData.sheet;
  const edges = group.userData.edges;
  const grid = group.userData.grid;
  group.userData.curlProgress = 0;

  const startTime = performance.now();

  function animate() {
    const elapsed = (performance.now() - startTime) / 1000;
    const rawProgress = Math.min(elapsed / duration, 1);

    // Ease in-out
    const progress = rawProgress < 0.5
      ? 2 * rawProgress * rawProgress
      : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

    group.userData.curlProgress = progress;

    // Fade in material
    const fadeIn = Math.min(rawProgress * 3, 1);
    sheet.material.opacity = fadeIn * 0.85;
    edges.material.opacity = fadeIn * 0.3;
    grid.material.opacity = fadeIn * 0.15;

    updateGoldenSheet(group, performance.now() / 1000);

    if (rawProgress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Hold for a moment then fade away
      setTimeout(() => fadeOutSheet(group, 0.8), 400);
    }
  }

  requestAnimationFrame(animate);
}

function fadeOutSheet(group, duration = 0.8) {
  const sheet = group.userData.sheet;
  const edges = group.userData.edges;
  const grid = group.userData.grid;
  const flare = group.userData.flare;
  const flareLight = group.userData.flareLight;
  const startTime = performance.now();

  function animate() {
    const elapsed = (performance.now() - startTime) / 1000;
    const progress = Math.min(elapsed / duration, 1);

    sheet.material.opacity = 0.85 * (1 - progress);
    edges.material.opacity = 0.3 * (1 - progress);
    grid.material.opacity = 0.15 * (1 - progress);
    flare.material.opacity *= 0.95;
    flareLight.intensity *= 0.95;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      group.visible = false;
      sheet.material.opacity = 0;
      edges.material.opacity = 0;
      grid.material.opacity = 0;
      flare.material.opacity = 0;
      flareLight.intensity = 0;
    }
  }

  requestAnimationFrame(animate);
}
