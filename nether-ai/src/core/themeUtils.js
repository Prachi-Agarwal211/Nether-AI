// src/core/themeUtils.js

import { generateGradientCss, generateRootCss } from './cssGenerator';

// Simple HSL to Hex converter
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Helper to resolve color references from the brief
function parseColor(colorRef, palette) {
  if (!colorRef || !palette) return '#000000';
  if (colorRef.startsWith('#')) return colorRef;

  // Handle nested references like "primary.main"
  const keys = colorRef.split('.');
  let value = palette;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return '#000000';
  }
  return typeof value === 'string' ? value : '#000000';
}

// Generates CSS from an AI design brief
// Input: designBrief JSON from generateDesignSystem
// Output: CSS string with variables and utility classes
export function generateCssFromBrief(brief) {
  if (!brief) return '';
  
  const { themeName, colorPalette, typography, styleTokens } = brief;
  const cssVariables = [];

  // Color Palette Variables
  Object.entries(colorPalette || {}).forEach(([type, values]) => {
    Object.entries(values).forEach(([variant, hex]) => {
      cssVariables.push(`--color-${type}-${variant}: ${hex};`);
    });
  });

  // Typography Variables
  cssVariables.push(`--font-heading: "${typography?.fontFamilies?.heading || 'Inter'}", sans-serif;`);
  cssVariables.push(`--font-body: "${typography?.fontFamilies?.body || 'Inter'}", sans-serif;`);

  // Style Token Variables
  Object.entries(styleTokens || {}).forEach(([category, values]) => {
    Object.entries(values).forEach(([token, value]) => {
      cssVariables.push(`--token-${category}-${token}: ${value};`);
    });
  });

  let css = generateRootCss(cssVariables);

  // Utility Class for Gradient Text
  const headingGradient = typography?.textEffects?.headingGradient;
  if (headingGradient?.colors) {
    const gradientColors = headingGradient.colors
      .map(ref => parseColor(ref, colorPalette));
    css += generateGradientCss(gradientColors);
  }

  return css;
}

// Generates a professional, harmonious color palette from a single base color.
export function generatePalette(baseHex = '#00FFFF') {
  try {
    let r = parseInt(baseHex.slice(1, 3), 16);
    let g = parseInt(baseHex.slice(3, 5), 16);
    let b = parseInt(baseHex.slice(5, 7), 16);
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return {
      primary: hslToHex(h, s, l),
      secondary: hslToHex((h + 30) % 360, Math.max(0, s - 10), Math.min(100, l + 10)),
      accent: hslToHex((h + 180) % 360, s, l),
      background: '#05060A',
      textPrimary: '#F0F4FF',
    };
  } catch (e) {
    return {
      primary: '#00FFFF',
      secondary: '#66FFFF',
      accent: '#FF66FF',
      background: '#05060A',
      textPrimary: '#F0F4FF',
    };
  }
}

export function generateBackgroundCss(brief, variant = 'default') {
  if (!brief?.backgroundSystem) return brief?.colorPalette?.background?.default || '#000000';

  const { backgroundSystem, colorPalette } = brief;
  const recipe = backgroundSystem.recipes?.[variant];
  if (!recipe) return colorPalette.background.default;

  const generator = backgroundSystem.types?.[recipe.type];
  if (!generator) return colorPalette.background.default;

  switch (recipe.type) {
    case 'aurora':
      const colors = generator.colors.map(ref => parseColor(ref, colorPalette));
      const opacity = generator.opacity || 0.2;
      return `
        radial-gradient(ellipse at 70% 20%, ${colors[0]}${Math.round(opacity*255).toString(16).padStart(2, '0')}, transparent 50%),
        radial-gradient(ellipse at 30% 80%, ${colors[1]}${Math.round(opacity*255).toString(16).padStart(2, '0')}, transparent 50%),
        ${colorPalette.background.default}
      `;
    case 'mesh':
      const meshColors = generator.colors.map(ref => parseColor(ref, colorPalette));
      return `
        radial-gradient(at 10% 10%, ${meshColors[0]} 0px, transparent 50%),
        radial-gradient(at 80% 20%, ${meshColors[1]} 0px, transparent 50%),
        radial-gradient(at 70% 90%, ${meshColors[2]} 0px, transparent 50%),
        ${colorPalette.background.default}
      `;
    default:
      return colorPalette.background.default;
  }
}
