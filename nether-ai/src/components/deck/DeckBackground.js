'use client';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { generateBackgroundCss } from '@/core/themeUtils';

export default function DeckBackground({ designSystem, backgroundVariant = 'default', animated = true }) {
  const controls = useAnimation();
  
  const backgroundStyle = useMemo(() => {
    const background = generateBackgroundCss(designSystem, backgroundVariant);
    return { background };
  }, [designSystem, backgroundVariant]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      controls.stop();
    };
  }, [controls]);

  if (!designSystem) return null;

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full z-0"
      initial={animated ? { opacity: 0 } : false}
      animate={controls}
      transition={{ duration: 0.5 }}
      style={backgroundStyle}
    />
  );
}
