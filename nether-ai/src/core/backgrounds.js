// src/core/backgrounds.js

// A library of generative background functions.
// Each function takes a color palette and returns a CSS background string.

export const backgroundRecipes = {
  aurora: (palette) => {
    return `radial-gradient(ellipse at 50% 0%, ${palette.primary}22, transparent 50%),
            radial-gradient(ellipse at 100% 100%, ${palette.secondary}22, transparent 60%),
            radial-gradient(ellipse at 0% 100%, ${palette.accent}1A, transparent 50%),
            ${palette.background}`;
  },
  gradientMesh: (palette) => {
    // A simplified CSS-only mesh effect
    return `radial-gradient(at 70% 20%, ${palette.primary} 0px, transparent 50%),
            radial-gradient(at 10% 80%, ${palette.secondary} 0px, transparent 50%),
            radial-gradient(at 90% 90%, ${palette.accent} 0px, transparent 50%),
            ${palette.background}`;
  },
  geometric: (palette) => {
    return `linear-gradient(135deg, ${palette.background} 25%, transparent 25%),
            linear-gradient(225deg, ${palette.background} 25%, transparent 25%),
            linear-gradient(45deg, ${palette.background} 25%, transparent 25%),
            linear-gradient(315deg, ${palette.background} 25%, ${palette.primary}1A 25%);
            background-size: 40px 40px;`;
  },
  subtleTexture: (palette) => {
    // A subtle paper-like texture
    const noise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;
    return `${noise}, linear-gradient(180deg, ${palette.background}, #0B0E14)`;
  },
  subtleNoise: (palette) => {
    const noise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;
    return `${noise}, linear-gradient(180deg, ${palette.background}, #0B0E14)`;
  },
};
