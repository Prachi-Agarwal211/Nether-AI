'use client';

import { motion } from 'framer-motion';
import { useTheme } from '../ThemeProvider';
import { pickTextColorForBackground } from '@/core/themeUtils';

export function SlideWrapper({ title, children, animated, className = '' }) {
  const theme = useTheme();
  
  const bgColor = theme?.colorPalette?.background?.default || '#000000';
  const textColor = pickTextColorForBackground(bgColor);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className={`w-full h-full p-12 md:p-16 flex flex-col ${className}`}
      style={{ color: textColor }}
      variants={animated ? containerVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
    >
      {title && (
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-10 text-center w-full max-w-5xl mx-auto"
          style={{ color: 'var(--color-text-primary, ' + textColor + ')' }}
          variants={animated ? titleVariants : undefined}
        >
          {title}
        </motion.h2>
      )}
      <div className="w-full flex-1 flex items-center justify-center">
        {children}
      </div>
    </motion.div>
  );
}
