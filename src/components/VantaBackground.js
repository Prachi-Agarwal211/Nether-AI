// src/components/VantaBackground.js

'use client';

import React, { useEffect, useRef, useState } from 'react';

// Hoist palettes to module scope to keep stable references across renders
const colorPalettes = [
  { highlight: 0xfadadd, midtone: 0xebd8e6, lowlight: 0xffe1c6 },
  { highlight: 0xebd8e6, midtone: 0xffe1c6, lowlight: 0xfadadd },
  { highlight: 0xffe1c6, midtone: 0xfadadd, lowlight: 0xebd8e6 },
];

const VantaBackground = () => {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Phase 1: Use IntersectionObserver to defer initialization until visible
  useEffect(() => {
    if (!vantaRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(vantaRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let effect; // Use a local variable for the instance

    // Helper function to load a script and return a promise
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          return resolve();
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
      });
    };

    const waitFor = (predicate, timeoutMs = 3000) => new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if (predicate()) return resolve();
        if (Date.now() - start > timeoutMs) return reject(new Error('Timed out waiting for dependency'));
        requestAnimationFrame(tick);
      };
      tick();
    });

    const initializeVanta = async () => {
      try {
        if (typeof window === 'undefined') return;
        // Load THREE.js globally from a stable CDN version known to work with Vanta
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
        await waitFor(() => !!(window.THREE && window.THREE.Color));
        // Load a pinned Vanta version after THREE exists on window
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.fog.min.js');
        await waitFor(() => !!(window.VANTA && window.VANTA.FOG));

        if (vantaRef.current && window.VANTA && window.VANTA.FOG && window.THREE) {
          effect = window.VANTA.FOG({
            el: vantaRef.current,
            THREE: window.THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            highlightColor: colorPalettes[0].highlight,
            midtoneColor: colorPalettes[0].midtone,
            lowlightColor: colorPalettes[0].lowlight,
            baseColor: 0x0,
            blurFactor: 0.50,
            speed: 1.30,
            zoom: 0.80,
          });
          setVantaEffect(effect);
        } else {
          throw new Error('Vanta.js or THREE.js failed to initialize');
        }
      } catch (error) {
        console.error('Vanta.js initialization failed:', error);
      }
    };

    initializeVanta();

    // Correct cleanup logic
    return () => {
      if (effect) {
        effect.destroy();
      }
    };
  }, [isVisible]); // Initialize when visible

  // Smoothly tween Vanta fog colors using requestAnimationFrame
  useEffect(() => {
    if (!vantaEffect) return;

    // Helper converters
    const hexStrToInt = (hex) => {
      if (!hex) return null;
      const s = hex.trim().replace('#', '');
      const full = s.length === 3 ? s.split('').map(c => c + c).join('') : s;
      const n = parseInt(full, 16);
      return Number.isFinite(n) ? n : null;
    };
    const intToRgb = (n) => ({ r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 });
    const rgbToInt = ({ r, g, b }) => ((r & 255) << 16) | ((g & 255) << 8) | (b & 255);
    const mix = (a, b, t) => {
      const ar = intToRgb(a), br = intToRgb(b);
      const r = Math.round(ar.r + (br.r - ar.r) * t);
      const g = Math.round(ar.g + (br.g - ar.g) * t);
      const bch = Math.round(ar.b + (br.b - ar.b) * t);
      return rgbToInt({ r, g, b: bch });
    };
    const easeInOut = (t) => 0.5 - Math.cos(Math.PI * t) / 2;

    // Build palette list from CSS variables if present, else fallback defaults
    const computed = getComputedStyle(document.documentElement);
    const acc1 = hexStrToInt(computed.getPropertyValue('--gds-accent-primary'));
    const acc2 = hexStrToInt(computed.getPropertyValue('--gds-accent-secondary'));
    const neut = hexStrToInt(computed.getPropertyValue('--gds-neutral'));
    const derived = (acc1 && acc2 && neut)
      ? [
          { highlight: acc1, midtone: acc2, lowlight: neut },
          { highlight: acc2, midtone: neut, lowlight: acc1 },
          { highlight: neut, midtone: acc1, lowlight: acc2 },
        ]
      : colorPalettes;

    let rafId;
    const segmentMs = 12000; // 12s per transition
    let segStart = performance.now();
    let segIndex = 0;

    const tick = (now) => {
      const from = derived[segIndex % derived.length];
      const to = derived[(segIndex + 1) % derived.length];
      const t = Math.min(1, (now - segStart) / segmentMs);
      const te = easeInOut(t);
      // Interpolate each channel
      const curr = {
        highlight: mix(from.highlight, to.highlight, te),
        midtone: mix(from.midtone, to.midtone, te),
        lowlight: mix(from.lowlight, to.lowlight, te),
      };
      // Update running Vanta effect
      vantaEffect.setOptions({
        highlightColor: curr.highlight,
        midtoneColor: curr.midtone,
        lowlightColor: curr.lowlight,
      });
      if (t >= 1) {
        segIndex = (segIndex + 1) % derived.length;
        segStart = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [vantaEffect]);

  return <div ref={vantaRef} className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none" />;
};

export default VantaBackground;
