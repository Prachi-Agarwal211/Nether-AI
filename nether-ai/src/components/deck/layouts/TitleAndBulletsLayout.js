'use client';

import { motion } from 'framer-motion';

export default function TitleAndBulletsLayout({ title, bullets = [], background, animated }) {
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
      className="relative h-full w-full overflow-hidden"
      style={{ background }}
      variants={animated ? containerVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
    >
      <motion.div
        className="absolute inset-0 flex flex-col p-12"
        variants={animated ? containerVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
      >
        {title && (
          <motion.h1
            initial={animated ? { opacity: 0 } : false}
            animate={animated ? { opacity: 1 } : false}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold mb-8"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            {title}
          </motion.h1>
        )}
        {!!(bullets && bullets.length) && (
          <ul className="space-y-4 text-2xl">
            {(bullets || []).map((item, index) => (
              <motion.li
                key={index}
                variants={itemVariants}
                className="flex items-start"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                <span style={{ color: 'var(--color-primary)' }}>◆</span>
                <div>
                  {typeof item === 'object' ? (
                    <>
                      <motion.p
                        initial={animated ? { opacity: 0 } : false}
                        animate={animated ? { opacity: 1 } : false}
                        transition={{ duration: 0.5 }}
                        className="font-bold"
                      >
                        {item.title}
                      </motion.p>
                      {item.description && (
                        <motion.p
                          initial={animated ? { opacity: 0 } : false}
                          animate={animated ? { opacity: 1 } : false}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="text-lg mt-1"
                        >
                          {item.description}
                        </motion.p>
                      )}
                    </>
                  ) : (
                    <motion.p
                      initial={animated ? { opacity: 0 } : false}
                      animate={animated ? { opacity: 1 } : false}
                      transition={{ duration: 0.5 }}
                      className=""
                    >
                      {item}
                    </motion.p>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
}
