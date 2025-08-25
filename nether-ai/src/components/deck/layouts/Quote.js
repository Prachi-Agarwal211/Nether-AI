'use client';
import { motion } from 'framer-motion';

export function Quote({ quote, author, animated, recipe }) {
  const accent1 = recipe?.theme_runtime?.accent || 'var(--accent-primary)';

  const quoteVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="w-full h-full p-16 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="text-6xl md:text-8xl font-serif mb-6"
        style={{ color: accent1 }}
      >
        “
      </motion.div>
      <motion.blockquote
        variants={animated ? quoteVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        className="text-3xl md:text-5xl font-medium leading-tight max-w-4xl"
      >
        {quote}
      </motion.blockquote>
      {author && (
        <motion.cite
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-lg md:text-xl text-text-secondary"
        >
          — {author}
        </motion.cite>
      )}
    </div>
  );
}
