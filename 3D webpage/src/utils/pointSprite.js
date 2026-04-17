import * as THREE from 'three';

let softParticleSprite = null;

export function getSoftParticleSprite() {
  if (softParticleSprite) {
    return softParticleSprite;
  }

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(
    size * 0.5,
    size * 0.5,
    0,
    size * 0.5,
    size * 0.5,
    size * 0.5,
  );

  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.96)');
  gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.55)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  softParticleSprite = new THREE.CanvasTexture(canvas);
  softParticleSprite.colorSpace = THREE.SRGBColorSpace;
  softParticleSprite.magFilter = THREE.LinearFilter;
  softParticleSprite.minFilter = THREE.LinearMipmapLinearFilter;
  softParticleSprite.needsUpdate = true;

  return softParticleSprite;
}
