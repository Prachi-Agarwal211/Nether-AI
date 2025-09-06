'use client';

import { motion } from 'framer-motion';

export function FullBleedImageLayout({ title, subtitle, imageUrl, animated }) {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 15, stiffness: 100 } },
  };

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center text-center" style={{ color: 'var(--color-text-primary)' }}>
      {/* Background Image */}
      {imageUrl && (
        <motion.div
          className="absolute inset-0 bg-black"
          initial={animated ? { opacity: 0 } : false}
          animate={animated ? { opacity: 1 } : false}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          <img src={imageUrl} alt={title || 'Background'} className="w-full h-full object-cover" />
          {/* Overlay for readability */}
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(var(--color-background-rgb), 0.6)' }} />
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        className="relative z-10 p-8"
        variants={animated ? containerVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
      >
        {title && (
          <motion.h1
            className="text-6xl md:text-8xl font-extrabold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
            variants={animated ? itemVariants : undefined}
          >
            {title}
          </motion.h1>
        )}
        {subtitle && (
          <motion.p
            className="text-xl md:text-3xl max-w-4xl"
            style={{ color: 'var(--color-text-secondary)' }}
            variants={animated ? itemVariants : undefined}
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
