'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export function ProcessDiagram({ title, steps = [], animated }) {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 15, stiffness: 100 } }
  };

  return (
    <motion.div
      className="w-full h-full p-16 flex flex-col items-center justify-center"
      variants={animated ? containerVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
    >
      {title && (
        <motion.h2
          variants={itemVariants}
          className="text-5xl font-bold mb-16 text-center"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </motion.h2>
      )}

      <div className="flex items-center justify-center w-full">
        {(steps || []).map((step, i) => (
          <React.Fragment key={i}>
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center text-center p-4 max-w-[260px]"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4"
                style={{ background: 'var(--color-primary-accent)', color: 'var(--color-text-primary)' }}
              >
                {i + 1}
              </div>
              {step.title && (
                <h3 className="font-semibold text-xl mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  {step.title}
                </h3>
              )}
              {step.description && (
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {step.description}
                </p>
              )}
            </motion.div>

            {i < steps.length - 1 && (
              <motion.div variants={itemVariants} className="mx-2">
                <ChevronRight className="w-12 h-12" style={{ color: 'var(--color-secondary-accent)' }} />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}
