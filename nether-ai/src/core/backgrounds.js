// src/core/backgrounds.js

// A library of generative functions that interpret AI background recipes
// Each function takes the color palette and recipe parameters

function getColor(palette, colorRef) {
  // Convert a palette color name or a hex code to a usable value
  return palette[colorRef] || colorRef;
}

export const backgroundGenerators = {
  aurora: (palette, params) => {
    const color1 = getColor(palette, params.colors?.[0] || palette.primaryAccent);
    const color2 = getColor(palette, params.colors?.[1] || palette.secondaryAccent);
    const opacity = params.opacity || 0.15;
    
    return `radial-gradient(ellipse at 50% 0%, ${color1}${Math.round(opacity*255).toString(16).padStart(2, '0')}, transparent 50%),
            radial-gradient(ellipse at 100% 100%, ${color2}${Math.round(opacity*255).toString(16).padStart(2, '0')}, transparent 60%),
            ${palette.background}`;
  },
  
  gradient: (palette, params) => {
    const angle = params.angle || 145;
    const stops = (params.stops || [palette.backgroundStart || '#000000', palette.backgroundEnd || palette.background])
      .map(stop => getColor(palette, stop)).join(', ');
    return `linear-gradient(${angle}deg, ${stops})`;
  },
  
  noise: (palette, params) => {
    const intensity = params.intensity || 0.05;
    const color = getColor(palette, params.color || palette.background);
    const noiseSvg = `
      <svg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'>
        <filter id='noiseFilter'>
          <feTurbulence 
            type='fractalNoise' 
            baseFrequency='${intensity}' 
            numOctaves='3' 
            stitchTiles='stitch'/>
        </filter>
        <rect width='100%' height='100%' filter='url(#noiseFilter)' opacity='0.8'/>
      </svg>
    `;
    return `url("data:image/svg+xml,${encodeURIComponent(noiseSvg)}"), ${color}`;
  },
  
  // Utility function to generate background from recipe
  generateBackground: (palette, recipe) => {
    if (!recipe || !recipe.type) return palette.background;
    const generator = backgroundGenerators[recipe.type];
    return generator ? generator(palette, recipe.parameters || {}) : palette.background;
  }
};
