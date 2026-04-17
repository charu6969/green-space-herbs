import * as THREE from 'three';
import { createOrbitalRings, updateRings } from './rings.js';
import { getSoftParticleSprite } from '../utils/pointSprite.js';

// ---------------------------------------------------------------------------
// Smooth lotus petal geometry — curved, elegant, tapered tip
// ---------------------------------------------------------------------------
function createPetalGeometry(width, height) {
  const segX = 12;
  const segY = 20;
  const geo = new THREE.PlaneGeometry(width, height, segX, segY);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    // Normalize coords: u = -0.5..0.5, t = 0 (base) to 1 (tip)
    const u = v.x / width;
    const t = (v.y / height) + 0.5;

    // Smooth pointed taper — narrows gently toward tip
    const taper = Math.pow(1.0 - t, 0.4) * (1.0 - Math.pow(t, 3.5));
    v.x *= Math.max(taper * 2.2, 0.005);

    // Shift base to y=0
    v.y = t * height;

    // Curvature — petal curves back naturally
    const curlBack = Math.pow(t, 2.0) * 0.35;
    const bowlCurve = (1.0 - Math.abs(u * 2)) * 0.12 * Math.sin(t * Math.PI * 0.9);
    
    // Central ridge
    const ridge = Math.pow(1.0 - Math.abs(u * 2), 3) * 0.06 * Math.sin(t * Math.PI * 0.8);

    v.z = -curlBack + bowlCurve + ridge;

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

// ---------------------------------------------------------------------------
// Petal material — glowing translucent green crystal-glass
// ---------------------------------------------------------------------------
function createPetalMaterial({ color, emissive, emissiveIntensity = 0.4, opacity = 0.88 }) {
  return new THREE.MeshPhysicalMaterial({
    color,
    emissive,
    emissiveIntensity,
    transparent: true,
    opacity,
    roughness: 0.15,
    metalness: 0.05,
    transmission: 0.3,
    thickness: 0.5,
    ior: 1.45,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    sheen: 0.6,
    sheenColor: new THREE.Color(0x00ff88),
    sheenRoughness: 0.2,
    side: THREE.DoubleSide,
    envMapIntensity: 1.2,
  });
}

// ---------------------------------------------------------------------------
// Add a ring of petals to the lotus
// ---------------------------------------------------------------------------
function addPetalRing(group, petals, config) {
  const geo = createPetalGeometry(config.width, config.height);
  const mat = createPetalMaterial(config.material);

  for (let i = 0; i < config.count; i++) {
    const angle = (i / config.count) * Math.PI * 2 + (config.offset || 0);
    const petal = new THREE.Mesh(geo, mat);

    // Position around the center
    petal.position.set(
      Math.cos(angle) * config.radius,
      config.y,
      Math.sin(angle) * config.radius,
    );

    // Face outward and tilt open
    petal.rotation.y = -angle + Math.PI / 2;
    petal.rotation.x = -config.tilt;

    // Store for animation
    petal.userData.baseRotX = petal.rotation.x;
    petal.userData.baseRotZ = petal.rotation.z;
    petal.userData.offset = angle + config.y * 3;
    petal.userData.breathAmp = config.breathAmp || 0.012;

    petals.push(petal);
    group.add(petal);
  }
}

// ---------------------------------------------------------------------------
// Central glow core — pulsing sphere
// ---------------------------------------------------------------------------
function createCore() {
  const g = new THREE.Group();

  // Inner bright core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.95,
    })
  );
  g.add(core);

  // Glow shell 1
  g.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  ));

  // Glow shell 2
  g.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0x00ff66,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  ));

  // Point light
  const light = new THREE.PointLight(0x00ff88, 4, 5);
  g.add(light);

  g.position.y = 0.35;
  return g;
}

// ---------------------------------------------------------------------------
// CREATE LOTUS
// ---------------------------------------------------------------------------
export function createLotus() {
  const group = new THREE.Group();
  const petals = [];

  // Ring 1 — outermost, fully opened petals (deep green)
  addPetalRing(group, petals, {
    count: 8,
    radius: 0.48,
    width: 0.5,
    height: 1.1,
    y: 0.0,
    tilt: 1.2,           // wide open
    offset: 0.0,
    breathAmp: 0.015,
    material: {
      color: 0x0a5c2a,
      emissive: 0x00ff88,
      emissiveIntensity: 0.25,
      opacity: 0.85,
    },
  });

  // Ring 2 — mid petals, slightly more upright (medium green)
  addPetalRing(group, petals, {
    count: 8,
    radius: 0.36,
    width: 0.44,
    height: 1.0,
    y: 0.06,
    tilt: 0.9,
    offset: Math.PI / 8,
    breathAmp: 0.013,
    material: {
      color: 0x0f8040,
      emissive: 0x00ff88,
      emissiveIntensity: 0.35,
      opacity: 0.88,
    },
  });

  // Ring 3 — inner petals, cupping inward (bright green)
  addPetalRing(group, petals, {
    count: 7,
    radius: 0.24,
    width: 0.38,
    height: 0.85,
    y: 0.12,
    tilt: 0.6,
    offset: 0.22,
    breathAmp: 0.01,
    material: {
      color: 0x15a050,
      emissive: 0x00ff88,
      emissiveIntensity: 0.5,
      opacity: 0.9,
    },
  });

  // Ring 4 — innermost small petals, nearly upright (neon)
  addPetalRing(group, petals, {
    count: 5,
    radius: 0.13,
    width: 0.28,
    height: 0.65,
    y: 0.2,
    tilt: 0.35,
    offset: 0.4,
    breathAmp: 0.008,
    material: {
      color: 0x22c55e,
      emissive: 0x00ff88,
      emissiveIntensity: 0.7,
      opacity: 0.92,
    },
  });

  // Central energy core
  const energyCore = createCore();
  group.add(energyCore);
  group.userData.energyCore = energyCore;

  // Lotus lighting
  const topLight = new THREE.PointLight(0x00ff88, 3, 7);
  topLight.position.set(0, 2, 0.5);
  group.add(topLight);

  const rimLight = new THREE.PointLight(0x22c55e, 1.5, 5);
  rimLight.position.set(0.5, 0.5, 0.7);
  group.add(rimLight);

  const fillLight = new THREE.PointLight(0x00ff66, 1.2, 4);
  fillLight.position.set(-0.5, 0.3, 0.4);
  group.add(fillLight);

  // Orbital ring
  const rings = createOrbitalRings(1, 1.5, 0x00ff88);
  rings.position.y = 0.2;
  group.add(rings);
  group.userData.rings = rings;

  // Floating sparkles
  const sparkCount = 300;
  const sparkPos = new Float32Array(sparkCount * 3);
  const sparkCol = new Float32Array(sparkCount * 3);
  const cNeon = new THREE.Color(0x00ff88);
  const cWhite = new THREE.Color(0xccffee);
  const cDeep = new THREE.Color(0x22c55e);

  for (let i = 0; i < sparkCount; i++) {
    const i3 = i * 3;
    const a = Math.random() * Math.PI * 2;
    const r = 0.2 + Math.random() * 1.5;
    const c = Math.random() > 0.6 ? cNeon : Math.random() > 0.3 ? cDeep : cWhite;

    sparkPos[i3] = Math.cos(a) * r;
    sparkPos[i3 + 1] = (Math.random() - 0.3) * 1.2;
    sparkPos[i3 + 2] = Math.sin(a) * r;

    sparkCol[i3] = c.r;
    sparkCol[i3 + 1] = c.g;
    sparkCol[i3 + 2] = c.b;
  }

  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkCol, 3));

  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
    map: getSoftParticleSprite(),
    size: 0.04,
    transparent: true,
    opacity: 0.8,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    alphaTest: 0.04,
  }));
  sparks.userData.base = sparkPos.slice();
  group.add(sparks);
  group.userData.sparks = sparks;

  // Ground glow disc
  const groundGlow = new THREE.Mesh(
    new THREE.CircleGeometry(2.0, 64),
    new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.035,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  groundGlow.rotation.x = -Math.PI / 2;
  groundGlow.position.y = -0.05;
  group.add(groundGlow);

  // Ground rings
  for (let i = 0; i < 3; i++) {
    const gr = new THREE.Mesh(
      new THREE.TorusGeometry(0.9 + i * 0.5, 0.003, 8, 128),
      new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.12 - i * 0.03,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    gr.rotation.x = Math.PI / 2;
    gr.position.y = -0.04;
    group.add(gr);
  }

  group.userData.petals = petals;
  group.position.set(0, -0.6, -2.0);
  group.scale.set(2.0, 2.0, 2.0);

  return group;
}

// ---------------------------------------------------------------------------
// SMOOTH ANIMATION
// ---------------------------------------------------------------------------
export function updateLotus(lotus, time) {
  // Gentle slow rotation
  lotus.rotation.y = time * 0.12;

  // Soft floating bob
  lotus.position.y = -0.6 + Math.sin(time * 0.5) * 0.035;

  // Orbital ring
  if (lotus.userData.rings) {
    updateRings(lotus.userData.rings, time);
  }

  // Petal breathing — very gentle opening/closing
  if (lotus.userData.petals) {
    for (const p of lotus.userData.petals) {
      const breath = Math.sin(time * 0.6 + p.userData.offset) * p.userData.breathAmp;
      p.rotation.x = p.userData.baseRotX + breath;
    }
  }

  // Core pulse — smooth sine wave
  if (lotus.userData.energyCore) {
    const core = lotus.userData.energyCore;
    const pulse = 1 + Math.sin(time * 2.0) * 0.12;
    core.children[0].scale.setScalar(pulse);
    core.children[1].scale.setScalar(pulse * 1.08);
    core.children[2].scale.setScalar(1 + Math.sin(time * 1.5) * 0.08);
    if (core.children[3]) core.children[3].intensity = 3.5 + Math.sin(time * 2.0) * 1.5;
  }

  // Sparkle drift — very gentle floating
  if (lotus.userData.sparks) {
    const sp = lotus.userData.sparks;
    const arr = sp.geometry.attributes.position.array;
    const base = sp.userData.base;
    const len = arr.length / 3;

    for (let i = 0; i < len; i++) {
      const i3 = i * 3;
      arr[i3]     = base[i3]     + Math.sin(time * 0.4 + i * 0.2) * 0.04;
      arr[i3 + 1] = base[i3 + 1] + Math.sin(time * 0.6 + i * 0.35) * 0.05;
      arr[i3 + 2] = base[i3 + 2] + Math.cos(time * 0.35 + i * 0.15) * 0.04;
    }

    sp.geometry.attributes.position.needsUpdate = true;
    sp.rotation.y = time * 0.04;
  }
}
