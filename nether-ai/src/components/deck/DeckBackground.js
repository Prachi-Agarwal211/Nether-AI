'use client';

import { motion } from 'framer-motion';
import { generateBackgroundCss } from '@/core/themeUtils';
import { useMemo } from 'react';

export default function DeckBackground({ designSystem, backgroundVariant = 'default', animated = true }) {

  const backgroundStyle = useMemo(() => ({
    background: generateBackgroundCss(designSystem, backgroundVariant)
  }), [designSystem, backgroundVariant]);

  if (!designSystem) return null;

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
