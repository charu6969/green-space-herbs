// postprocessing.js — Enhanced Bloom for neon green glow
import { EffectComposer, RenderPass, EffectPass, BloomEffect } from 'postprocessing';

export function createComposer(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Strong bloom for neon glow
  const bloom = new BloomEffect({
    intensity: 1.5,
    luminanceThreshold: 0.35,
    luminanceSmoothing: 0.4,
    radius: 0.85,
    mipmapBlur: true,
  });

  const effectPass = new EffectPass(camera, bloom);
  composer.addPass(effectPass);

  return { composer, bloom };
}
