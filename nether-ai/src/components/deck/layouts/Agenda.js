'use client';

import { motion } from 'framer-motion';

export function Agenda({ title = 'Agenda', items = [], animated }) {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 15, stiffness: 100 } }
  };

  return (
    <motion.div
      className="w-full h-full p-16 flex flex-col justify-center"
      variants={animated ? containerVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
    >
      <motion.h2
        initial={animated ? { opacity: 0 } : false}
        animate={animated ? { opacity: 1 } : false}
        transition={{ duration: 0.5 }}
        className="text-6xl font-bold mb-12"
        style={{ color: 'var(--color-textPrimary)' }}
      >
        {title}
      </motion.h2>
      
      <ul className="space-y-4">
        {(items || []).map((item, index) => (
          <motion.li
            key={index}
            variants={itemVariants}
            className="flex items-center gap-4 text-2xl"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            <span
              className="font-semibold text-3xl"
              style={{ color: 'var(--color-primary)' }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{item}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
