'use client';

import { motion } from 'framer-motion';

export function Agenda({ title = 'Agenda', items = [], animated, background }) {
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
      className="relative h-full w-full overflow-hidden"
      style={{ background }}
      variants={animated ? containerVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
    >
      <motion.div
        className="absolute inset-0 flex flex-col p-12"
        initial={animated ? { opacity: 0 } : false}
        animate={animated ? { opacity: 1 } : false}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          initial={animated ? { opacity: 0 } : false}
          animate={animated ? { opacity: 1 } : false}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold mb-8"
          style={{ color: 'var(--color-textPrimary)' }}
        >
          {title}
        </motion.h2>
        
        <motion.ul
          initial={animated ? { opacity: 0 } : false}
          animate={animated ? { opacity: 1 } : false}
          transition={{ duration: 0.5 }}
          className="space-y-6 text-2xl"
        >
          {(items || []).map((item, index) => (
            <motion.li
              key={index}
              variants={itemVariants}
              className="flex items-start"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              <span
                className="mr-3 text-3xl"
                style={{ color: 'var(--color-primary)' }}
              >
                {index + 1}.
              </span>
              <div>
                {typeof item === 'object' ? (
                  <>
                    <p className="font-bold">{item.title}</p>
                    {item.description && <p className="text-lg mt-2 opacity-80">{item.description}</p>}
                  </>
                ) : (
                  <p>{item}</p>
                )}
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
