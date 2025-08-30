'use client';
import { motion } from 'framer-motion';

export function TwoColumn({ title, leftTitle, rightTitle, bullets = [], background, animated, imagePosition = 'right' }) {
  const leftVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };
  const rightVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut', delay: 0.2 } }
  };

  // Set order classes based on imagePosition
  const contentOrder = imagePosition === 'left' ? 'md:order-2' : 'md:order-1';
  const imageOrder = imagePosition === 'left' ? 'md:order-1' : 'md:order-2';

  return (
    <div className="w-full h-full p-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <motion.div
        className={`${contentOrder}`}
        variants={animated ? leftVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
      >
        {title && <h2 className="text-4xl md:text-5xl font-bold mb-6">{title}</h2>}
        {leftTitle && <h2 className="text-3xl font-bold mb-6">{leftTitle}</h2>}
        <ul className="space-y-3">
          {bullets
            .filter((_, i) => i % 2 === 0)
            .map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-accent-primary mr-3 mt-1">✦</span>
                <div>
                  {typeof item === 'object' ? (
                    <>
                      <p className="font-bold">{item.title}</p>
                      {item.description && <p className="text-lg mt-1">{item.description}</p>}
                    </>
                  ) : (
                    <p>{item}</p>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </motion.div>
      <motion.div
        className={`${imageOrder}`}
        variants={animated ? rightVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        className="h-64 md:h-full w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10"
        style={{ background }}
      >
        {rightTitle && <h2 className="text-3xl font-bold mb-6">{rightTitle}</h2>}
        <ul className="space-y-3">
          {bullets
            .filter((_, i) => i % 2 === 1)
            .map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-accent-primary mr-3 mt-1">✦</span>
                <div>
                  {typeof item === 'object' ? (
                    <>
                      <p className="font-bold">{item.title}</p>
                      {item.description && <p className="text-lg mt-1">{item.description}</p>}
                    </>
                  ) : (
                    <p>{item}</p>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </motion.div>
    </div>
  );
}
