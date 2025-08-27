'use client';

import { motion } from 'framer-motion';
import { generatePalette } from '@/core/themeUtils';
import { backgroundRecipes } from '@/core/backgrounds';

export default function DeckBackground({ background, backgroundVariant, animated = true }) {
  const bg = background || { recipeName: 'subtleNoise', baseColor: '#00FFFF' };

  let backgroundStyle = {};
  try {
    // 1) Try CSS variable-based gradients first (from ThemeProvider): --gradient-<variant>
    if (backgroundVariant) {
      const varName = `--gradient-${backgroundVariant}`;
      const cssValue = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue(varName) : '';
      const v = cssValue && cssValue.trim();
      if (v) {
        backgroundStyle.background = v;
      }
    }
    // 2) Fallback to recipe-based generation if no CSS gradient found
    if (!backgroundStyle.background) {
      const palette = generatePalette(bg.baseColor);
      if (bg.recipeName && backgroundRecipes[bg.recipeName]) {
        backgroundStyle.background = backgroundRecipes[bg.recipeName](palette);
      } else {
        backgroundStyle.background = palette.background;
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to generate background:', e);
    backgroundStyle.background = '#05060A';
  }

  const bgVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.0, ease: 'easeInOut' } },
  };

  const Container = animated ? motion.div : 'div';

  return (
    <Container
      variants={animated ? bgVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
      className="absolute inset-0 w-full h-full z-0"
      style={backgroundStyle}
    />
  );
}
