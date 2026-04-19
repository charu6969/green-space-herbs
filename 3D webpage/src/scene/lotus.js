import * as THREE from 'three';
import { createOrbitalRings, updateRings } from './rings.js';
import { getSoftParticleSprite } from '../utils/pointSprite.js';

// ---------------------------------------------------------------------------
// Crystal petal geometry — wide, curved leaf with faceted crystal surface
// Low segment count + flatShading = crystal facets on a smooth lotus shape
// ---------------------------------------------------------------------------
function createPetalGeometry(width, height) {
  // Low segment count creates visible flat faces = crystal look
  const segX = 4;
  const segY = 6;
  const geo = new THREE.PlaneGeometry(width, height, segX, segY);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    const u = v.x / width;           // -0.5 to 0.5
    const t = (v.y / height) + 0.5;  // 0 (base) to 1 (tip)

    // Taper: wide at base, pointed at tip — lotus leaf shape
    const taper = Math.pow(1.0 - t, 0.35) * (1.0 - Math.pow(t, 2.5));
    v.x *= Math.max(taper * 2.5, 0.01);

    // Shift base to y=0
    v.y = t * height;

    // Gentle curvature — petal cups inward then curls back at tip
    const curlBack = Math.pow(t, 1.8) * 0.25;
    const bowlCurve = (1.0 - Math.abs(u * 2)) * 0.15 * Math.sin(t * Math.PI * 0.85);

    // Central ridge for thickness/crystal feel
    const ridge = Math.pow(1.0 - Math.abs(u * 2), 2) * 0.08 * Math.sin(t * Math.PI * 0.7);

    v.z = -curlBack + bowlCurve + ridge;

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

// ---------------------------------------------------------------------------
// Crystal material — faceted, reflective green crystal
// ---------------------------------------------------------------------------
function createPetalMaterial({ color, emissive, emissiveIntensity = 0.4, opacity = 0.92 }) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(emissive),
    emissiveIntensity,
    transparent: true,
    opacity,
    roughness: 0.12,
    metalness: 0.15,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
    side: THREE.DoubleSide,
    flatShading: true,  // This is key — creates the crystal facet look
    envMapIntensity: 1.3,
  });
}

// ---------------------------------------------------------------------------
// Add a ring of petals — perfectly symmetrical, no random variation
// ---------------------------------------------------------------------------
function addPetalRing(group, petals, config) {
  const geo = createPetalGeometry(config.width, config.height);
  const mat = createPetalMaterial(config.material);

  for (let i = 0; i < config.count; i++) {
    const angle = (i / config.count) * Math.PI * 2 + (config.offset || 0);
    const petal = new THREE.Mesh(geo, mat);

    // Position around the center — perfectly symmetrical
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
    petal.userData.baseRotZ = 0;
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
      color: 0xaaffcc,
      transparent: true,
      opacity: 0.95,
    })
  );
  g.add(core);

  // Glow shell 1
  g.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0x66ff88,
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
  const light = new THREE.PointLight(0x88ff66, 5, 5);
  g.add(light);

  g.position.y = 0.35;
  return g;
}

// ---------------------------------------------------------------------------
// CREATE LOTUS — dense, symmetrical crystal lotus matching reference
// ---------------------------------------------------------------------------
export function createLotus() {
  const group = new THREE.Group();
  const petals = [];

  // ===== Ring 1 — Outermost sepals, wide open (dark green) =====
  addPetalRing(group, petals, {
    count: 10,
    radius: 0.50,
    width: 0.58,
    height: 0.95,
    y: 0.0,
    tilt: 1.25,       // wide open, nearly horizontal
    offset: 0.0,
    breathAmp: 0.015,
    material: {
      color: 0x042a12,
      emissive: 0x001a08,
      emissiveIntensity: 0.4,
      opacity: 0.95,
    },
  });

  // ===== Ring 2 — Outer petals, angled out (dark-mid green) =====
  addPetalRing(group, petals, {
    count: 9,
    radius: 0.42,
    width: 0.54,
    height: 1.0,
    y: 0.04,
    tilt: 1.05,
    offset: Math.PI / 9,
    breathAmp: 0.014,
    material: {
      color: 0x063d1a,
      emissive: 0x0a2a10,
      emissiveIntensity: 0.45,
      opacity: 0.95,
    },
  });

  // ===== Ring 3 — Mid-outer petals (medium green) =====
  addPetalRing(group, petals, {
    count: 8,
    radius: 0.34,
    width: 0.50,
    height: 1.05,
    y: 0.08,
    tilt: 0.82,
    offset: Math.PI / 16,
    breathAmp: 0.013,
    material: {
      color: 0x0d5528,
      emissive: 0x1a4422,
      emissiveIntensity: 0.5,
      opacity: 0.93,
    },
  });

  // ===== Ring 4 — Mid petals, more upright (bright-mid green) =====
  addPetalRing(group, petals, {
    count: 8,
    radius: 0.26,
    width: 0.46,
    height: 1.1,
    y: 0.12,
    tilt: 0.6,
    offset: Math.PI / 8,
    breathAmp: 0.012,
    material: {
      color: 0x158040,
      emissive: 0x226633,
      emissiveIntensity: 0.6,
      opacity: 0.92,
    },
  });

  // ===== Ring 5 — Inner petals, mostly upright (bright green) =====
  addPetalRing(group, petals, {
    count: 7,
    radius: 0.18,
    width: 0.40,
    height: 1.0,
    y: 0.16,
    tilt: 0.4,
    offset: 0.25,
    breathAmp: 0.01,
    material: {
      color: 0x22aa55,
      emissive: 0x44cc33,
      emissiveIntensity: 0.7,
      opacity: 0.92,
    },
  });

  // ===== Ring 6 — Core petals, tight and vertical (vivid green) =====
  addPetalRing(group, petals, {
    count: 5,
    radius: 0.08,
    width: 0.32,
    height: 0.85,
    y: 0.22,
    tilt: 0.2,
    offset: Math.PI / 5,
    breathAmp: 0.008,
    material: {
      color: 0x33cc55,
      emissive: 0x66ff44,
      emissiveIntensity: 0.9,
      opacity: 0.95,
    },
  });

  // Central energy core
  const energyCore = createCore();
  group.add(energyCore);
  group.userData.energyCore = energyCore;

  // Lotus lighting
  const topLight = new THREE.PointLight(0x88ff55, 4, 7);
  topLight.position.set(0, 2, 0.5);
  group.add(topLight);

  const rimLight = new THREE.PointLight(0x22c55e, 2, 5);
  rimLight.position.set(0.5, 0.5, 0.7);
  group.add(rimLight);

  const fillLight = new THREE.PointLight(0x00ff66, 1.5, 4);
  fillLight.position.set(-0.5, 0.3, 0.4);
  group.add(fillLight);

  // Bottom light to illuminate the underside of outer petals
  const upLight = new THREE.PointLight(0x00ff88, 1.2, 3);
  upLight.position.set(0, -0.5, 0);
  group.add(upLight);

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
