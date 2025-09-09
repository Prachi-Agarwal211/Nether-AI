// src/core/themeUtils.js

// Add this function at the top of the file
export function pickTextColorForBackground(bgHex) {
  if (!bgHex || !bgHex.startsWith('#')) return '#f0f0f0';
  try {
    const rgb = parseInt(bgHex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    // WCAG Luma Formula
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 140 ? '#0a0a0a' : '#f0f0f0';
  } catch (e) {
    return '#f0f0f0';
  }
}

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
  if (!brief?.backgroundSystem || !brief?.colorPalette) 
    return brief?.colorPalette?.background?.default || '#000000';

  const { backgroundSystem, colorPalette } = brief;
  const recipe = backgroundSystem.recipes?.[variant];
  if (!recipe) return colorPalette?.background?.default || '#000000';

  const generator = backgroundSystem.types?.[recipe.type];
  if (!generator) return colorPalette?.background?.default || '#000000';

  const parse = (ref) => {
    if (!ref) return '#000000';
    if (ref.startsWith('#')) return ref;
    const keys = ref.split('.');
    let value = colorPalette;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return '#000000';
    }
    return value;
  };

  switch (recipe.type) {
    case 'aurora':
      const auroraColors = generator.colors?.map(parse) || ['#000000', '#000000'];
      return `radial-gradient(ellipse at 70% 20%, ${auroraColors[0]}20, transparent 50%), 
              radial-gradient(ellipse at 30% 80%, ${auroraColors[1]}20, transparent 50%), 
              ${colorPalette?.background?.default || '#000000'}`;
    case 'gradient':
      const gradColors = generator.colors?.map(parse) || ['#000000', '#000000'];
      const angle = generator.angle || 145;
      return `linear-gradient(${angle}deg, ${gradColors.join(', ')})`;
    case 'noise':
      return `url("data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E"), 
              ${colorPalette?.background?.default || '#000000'}`;
    default:
      return colorPalette?.background?.default || '#000000';
  }
}
