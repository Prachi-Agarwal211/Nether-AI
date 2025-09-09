// src/core/backgrounds.js

const recipes = {
  aurora: (p) => `radial-gradient(ellipse at 70% 20%, ${p.primary?.main || p.primary}20, transparent 50%), 
               radial-gradient(ellipse at 30% 80%, ${p.secondary?.main || p.secondary}20, transparent 50%), 
               ${p.background?.default || p.background}`,
  
  mesh: (p) => `radial-gradient(at 10% 10%, ${p.primary?.main || p.primary}30, transparent 50%), 
             radial-gradient(at 80% 20%, ${p.secondary?.main || p.secondary}30, transparent 50%), 
             radial-gradient(at 70% 90%, ${p.semantic?.success || p.accent}30, transparent 50%), 
             ${p.background?.default || p.background}`,
  
  noise: (p) => `url("data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E"), 
             ${p.background?.default || p.background}`,
  
  glass: (p) => `linear-gradient(135deg, ${p.primary?.main || p.primary}15, ${p.secondary?.main || p.secondary}15), 
               ${p.background?.default || p.background}`,
  
  plain: (p) => p.background?.default || p.background
};

export function pickBackgroundStyle(palette, slideId) {
  if (!palette || !slideId) return palette?.background?.default || '#000';
  
  const names = Object.keys(recipes);
  // Simple, deterministic seed based on the slide ID
  const index = (slideId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % names.length;
  const chosenRecipe = recipes[names[index]];
  
  return chosenRecipe(palette);
}
