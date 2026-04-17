// scrollAnimations.js — GSAP ScrollTrigger with proper section visibility
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { flashLightBeam, triggerBurst } from '../scene/transitions.js';
import { unfurlSheet } from '../scene/goldenSheet.js';
import { shiftParticleColors } from '../scene/particles.js';
import { setWaveMode } from '../scene/particleWave.js';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// Helper: reveal a section's inner container
function revealSection(sectionId) {
  const inner = document.querySelector(`${sectionId} .section-inner`);
  if (inner) {
    inner.style.opacity = '1';
    inner.style.visibility = 'visible';
  }
}

export function initScrollAnimations(sceneObjects) {
  const {
    lotus, goldenDroplet, helix, energySphere, crystalCluster,
    particleWave, particles, camera,
    lightBeam, particleBurst, goldenSheet
  } = sceneObjects;

  // ---- Hero: cinematic fade in ----
  gsap.fromTo('.hero-top',
    { opacity: 0, y: 60 },
    { opacity: 1, y: 0, duration: 2.0, ease: 'power3.out', delay: 0.5 }
  );

  gsap.fromTo('.hero-bottom',
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 1.8, ease: 'power3.out', delay: 1.2 }
  );

  // Hide scroll indicator on scroll
  ScrollTrigger.create({
    trigger: 'body',
    start: '100px top',
    onEnter: () => {
      gsap.to('#scroll-indicator', { opacity: 0, y: -10, duration: 0.5 });
    },
    onLeaveBack: () => {
      gsap.to('#scroll-indicator', { opacity: 1, y: 0, duration: 0.5 });
    }
  });

  // ---- Section 2: Unveiling Quantum Ayurveda ----
  ScrollTrigger.create({
    trigger: '#section-quantum',
    start: 'top 80%',
    end: 'bottom 20%',
    onEnter: () => {
      revealSection('#section-quantum');

      if (lightBeam) {
        lightBeam.position.set(0, 0, -3);
        flashLightBeam(lightBeam, 0.9);
      }

      gsap.fromTo('#section-quantum .qa-logo-icon',
        { opacity: 0, scale: 0.5, y: -30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }
      );

      gsap.fromTo('#section-quantum .section-label, #section-quantum .section-sublabel',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
      );

      gsap.fromTo('#section-quantum .section-title',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.4 }
      );

      gsap.fromTo('#section-quantum .section-subtitle',
        { opacity: 0 },
        { opacity: 0.85, duration: 0.8, delay: 0.6 }
      );

      gsap.fromTo('#section-quantum .info-card',
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.2, ease: 'power2.out', delay: 0.7 }
      );

      gsap.fromTo('#section-quantum .section-footer-text, #section-quantum .btn',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out', delay: 1.3 }
      );
    },
    once: true
  });

  // ---- Section 3: The 3-Stage System ----
  ScrollTrigger.create({
    trigger: '#section-process',
    start: 'top 75%',
    onEnter: () => {
      revealSection('#section-process');

      gsap.fromTo('#section-process > .section-inner > .section-title',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
      );
      gsap.fromTo('#section-process > .section-inner > .section-subtitle',
        { opacity: 0 },
        { opacity: 0.85, duration: 0.8, delay: 0.3 }
      );
    },
    once: true
  });

  // Stage 01 — Show golden droplet
  ScrollTrigger.create({
    trigger: '#stage-01',
    start: 'top 70%',
    end: 'bottom 30%',
    onEnter: () => {
      goldenDroplet.visible = true;
      goldenDroplet.position.set(2, 0, -2);
      goldenDroplet.scale.set(0.01, 0.01, 0.01);
      gsap.to(goldenDroplet.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'elastic.out(1, 0.5)' });
      gsap.to(goldenDroplet.rotation, { y: Math.PI * 2, duration: 20, repeat: -1, ease: 'none' });

      gsap.fromTo('#stage-01 .stage-label',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
      );
      gsap.fromTo('#stage-01 .stage-title',
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', delay: 0.15 }
      );
      gsap.fromTo('#stage-01 .stage-desc',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', delay: 0.3 }
      );
      gsap.fromTo('#stage-01 .stage-link',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', delay: 0.5 }
      );
    },
    onLeave: () => {
      gsap.to(goldenDroplet.scale, {
        x: 0.01, y: 0.01, z: 0.01, duration: 0.5,
        onComplete: () => { goldenDroplet.visible = false; }
      });

      if (goldenSheet) {
        goldenSheet.position.set(0, 0, -3);
        unfurlSheet(goldenSheet, 1.5);
      }
      if (particleBurst) {
        triggerBurst(particleBurst, new THREE.Vector3(0, 0, -2), 1.2);
      }
    },
    onEnterBack: () => {
      goldenDroplet.visible = true;
      gsap.to(goldenDroplet.scale, { x: 1, y: 1, z: 1, duration: 0.8 });
    },
    onLeaveBack: () => {
      gsap.to(goldenDroplet.scale, {
        x: 0.01, y: 0.01, z: 0.01, duration: 0.5,
        onComplete: () => { goldenDroplet.visible = false; }
      });
    }
  });

  // Stage 02 — Show energy sphere
  ScrollTrigger.create({
    trigger: '#stage-02',
    start: 'top 70%',
    end: 'bottom 30%',
    onEnter: () => {
      energySphere.visible = true;
      energySphere.position.set(-2, 0, -2);
      energySphere.scale.set(0.01, 0.01, 0.01);
      gsap.to(energySphere.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'elastic.out(1, 0.5)' });

      gsap.fromTo('#stage-02 .stage-label',
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
      );
      gsap.fromTo('#stage-02 .stage-title',
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', delay: 0.15 }
      );
      gsap.fromTo('#stage-02 .stage-desc',
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', delay: 0.3 }
      );
      gsap.fromTo('#stage-02 .stage-link',
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', delay: 0.5 }
      );
    },
    onLeave: () => {
      gsap.to(energySphere.scale, {
        x: 0.01, y: 0.01, z: 0.01, duration: 0.5,
        onComplete: () => { energySphere.visible = false; }
      });
      if (lightBeam) {
        lightBeam.position.set(0, 0, -3);
        flashLightBeam(lightBeam, 0.7);
      }
    },
    onEnterBack: () => {
      energySphere.visible = true;
      gsap.to(energySphere.scale, { x: 1, y: 1, z: 1, duration: 0.8 });
    },
    onLeaveBack: () => {
      gsap.to(energySphere.scale, {
        x: 0.01, y: 0.01, z: 0.01, duration: 0.5,
        onComplete: () => { energySphere.visible = false; }
      });
    }
  });

  // Stage 03 — Show crystal cluster
  ScrollTrigger.create({
    trigger: '#stage-03',
    start: 'top 70%',
    end: 'bottom 30%',
    onEnter: () => {
      crystalCluster.visible = true;
      crystalCluster.position.set(2, 0, -2);
      crystalCluster.scale.set(0.01, 0.01, 0.01);
      gsap.to(crystalCluster.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 1.2, ease: 'elastic.out(1, 0.5)' });

      gsap.fromTo('#stage-03 .stage-label',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
      );
      gsap.fromTo('#stage-03 .stage-title',
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', delay: 0.15 }
      );
      gsap.fromTo('#stage-03 .stage-desc',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', delay: 0.3 }
      );
      gsap.fromTo('#stage-03 .stage-link',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', delay: 0.5 }
      );
    },
    onLeave: () => {
      gsap.to(crystalCluster.scale, {
        x: 0.01, y: 0.01, z: 0.01, duration: 0.5,
        onComplete: () => { crystalCluster.visible = false; }
      });
      if (particleBurst) {
        triggerBurst(particleBurst, new THREE.Vector3(2, 0, -2), 1.5);
      }
    },
    onEnterBack: () => {
      crystalCluster.visible = true;
      gsap.to(crystalCluster.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.8 });
    },
    onLeaveBack: () => {
      gsap.to(crystalCluster.scale, {
        x: 0.01, y: 0.01, z: 0.01, duration: 0.5,
        onComplete: () => { crystalCluster.visible = false; }
      });
    }
  });

  // ---- Section 4: Benefits ----
  ScrollTrigger.create({
    trigger: '#section-benefits',
    start: 'top 75%',
    onEnter: () => {
      revealSection('#section-benefits');

      gsap.fromTo('#section-benefits .section-title',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
      gsap.fromTo('#section-benefits .section-subtitle',
        { opacity: 0 },
        { opacity: 0.85, duration: 0.6, delay: 0.2 }
      );
      gsap.fromTo('#section-benefits .benefit-card',
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: 'power2.out', delay: 0.4 }
      );
      gsap.fromTo('#section-benefits .btn, #section-benefits .section-footer-text',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 1.0 }
      );
    },
    once: true
  });

  // ---- Section 5: Partner — show particle wave ----
  ScrollTrigger.create({
    trigger: '#section-partner',
    start: 'top 70%',
    end: 'bottom 30%',
    onEnter: () => {
      revealSection('#section-partner');

      setWaveMode(particleWave, 'wave');
      particleWave.visible = true;
      particleWave.material.opacity = 0;
      gsap.to(particleWave.material, { opacity: 0.7, duration: 1.5 });

      gsap.fromTo('#section-partner .section-title',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
      gsap.fromTo('#section-partner .section-subtitle',
        { opacity: 0 },
        { opacity: 0.85, duration: 0.6, delay: 0.2 }
      );
      gsap.fromTo('#section-partner .partner-card',
        { opacity: 0, scale: 0.95, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.4 }
      );
      gsap.fromTo('#section-partner .partner-item',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out', delay: 0.7 }
      );
      gsap.fromTo('#section-partner .btn, #section-partner .section-footer-text',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 1.1 }
      );
    },
    onLeave: () => {
      gsap.to(particleWave.material, {
        opacity: 0, duration: 0.8,
        onComplete: () => { particleWave.visible = false; }
      });
    },
    onEnterBack: () => {
      setWaveMode(particleWave, 'wave');
      particleWave.visible = true;
      gsap.to(particleWave.material, { opacity: 0.7, duration: 1 });
    },
    onLeaveBack: () => {
      gsap.to(particleWave.material, {
        opacity: 0, duration: 0.8,
        onComplete: () => { particleWave.visible = false; }
      });
    }
  });

  // ---- Section 6: CTA — vortex mode ----
  ScrollTrigger.create({
    trigger: '#section-cta',
    start: 'top 70%',
    end: 'bottom bottom',
    onEnter: () => {
      revealSection('#section-cta');

      setWaveMode(particleWave, 'vortex');
      particleWave.visible = true;
      particleWave.material.opacity = 0;
      gsap.to(particleWave.material, { opacity: 0.55, duration: 1.5 });

      gsap.fromTo('#section-cta .cta-title',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
      );
      gsap.fromTo('#section-cta .cta-sub',
        { opacity: 0 },
        { opacity: 1, duration: 0.8, delay: 0.3 }
      );
      gsap.fromTo('#section-cta .cta-logo',
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)', delay: 0.5 }
      );
      gsap.fromTo('#section-cta .cta-brand, #section-cta .cta-brand-sub',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.8 }
      );
      gsap.fromTo('#section-cta .btn',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 1.1 }
      );
      gsap.fromTo('#section-cta .cta-footer',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, delay: 1.4 }
      );
    },
    onLeaveBack: () => {
      gsap.to(particleWave.material, {
        opacity: 0, duration: 0.8,
        onComplete: () => { particleWave.visible = false; }
      });
    }
  });

  // ---- Continuous scroll-driven effects ----
  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;

      // Shift particles
      particles.rotation.x = progress * 0.5;
      particles.position.y = -progress * 5;

      // Color shift
      shiftParticleColors(particles, progress);

      // Lotus fades after hero
      if (lotus) {
        const heroEnd = 0.12;
        lotus.visible = progress < 0.25;
      }

      // Video bg brightness
      const videoBg = document.getElementById('video-bg');
      if (videoBg) {
        const brightness = 0.3 + Math.sin(progress * Math.PI) * 0.12;
        videoBg.style.filter = `saturate(0.5) brightness(${brightness})`;
      }
    }
  });

  // Nav background on scroll
  ScrollTrigger.create({
    trigger: 'body',
    start: '50px top',
    onEnter: () => {
      document.getElementById('main-nav').style.background = 'rgba(2, 10, 4, 0.85)';
    },
    onLeaveBack: () => {
      document.getElementById('main-nav').style.background = 'rgba(2, 10, 4, 0.5)';
    }
  });
}
