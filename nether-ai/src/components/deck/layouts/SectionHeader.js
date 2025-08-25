'use client';
import { motion } from 'framer-motion';

export function SectionHeader({ title, animated }) {
  return (
    <div className="w-full h-full p-16 flex items-center">
      <motion.h2
        initial={animated ? { opacity: 0, x: -50 } : false}
        animate={animated ? { opacity: 1, x: 0 } : false}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-5xl md:text-7xl font-extrabold"
      >
        {title}
      </motion.h2>
    </div>
  );
}
