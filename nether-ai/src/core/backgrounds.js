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
  geometric: (palette) => {
    return `repeating-linear-gradient(45deg, ${palette.primary}11, ${palette.primary}11 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(-45deg, ${palette.secondary}11, ${palette.secondary}11 1px, transparent 1px, transparent 20px),
            ${palette.background}`;
  },
  subtleNoise: (palette) => {
    const noise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;
    return `${noise}, linear-gradient(180deg, ${palette.background}, #0B0E14)`;
  },
};
