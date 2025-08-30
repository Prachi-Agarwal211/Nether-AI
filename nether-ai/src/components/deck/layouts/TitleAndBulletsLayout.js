'use client';

import { motion } from 'framer-motion';

export function TitleAndBulletsLayout({ title, body, bullets, animated }) {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 15, stiffness: 100 } },
  };

  return (
    <motion.div
      className="w-full h-full p-16 flex flex-col justify-center"
      variants={animated ? containerVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
    >
      {title && (
        <motion.h2
          initial={animated ? { opacity: 0 } : false}
          animate={animated ? { opacity: 1 } : false}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold mb-8"
          style={{ color: 'var(--color-textPrimary)' }}
        >
          {title}
        </motion.h2>
      )}
      {body && (
        <motion.p
          initial={animated ? { opacity: 0 } : false}
          animate={animated ? { opacity: 1 } : false}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-white/80 mb-6"
        >
          {body}
        </motion.p>
      )}
      {!!(bullets && bullets.length) && (
        <ul className="space-y-4">
          {(bullets || []).map((item, index) => (
            <motion.li
              key={index}
              variants={itemVariants}
              className="flex items-start gap-4 text-xl"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              <span style={{ color: 'var(--color-primary)' }}>◆</span>
              <span>{item}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
