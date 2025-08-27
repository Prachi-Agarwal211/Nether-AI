'use client';

import { motion } from 'framer-motion';

export function Timeline({ title, events = [], animated }) {
  return (
    <motion.div
      className="w-full h-full p-16 flex flex-col items-center justify-center"
      initial={animated ? { opacity: 0, y: 20 } : false}
      animate={animated ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.4 }}
    >
      {title && (
        <h2 className="text-5xl font-bold mb-10 text-center" style={{ color: 'var(--color-textPrimary)' }}>
          {title}
        </h2>
      )}
      <div className="w-full max-w-5xl">
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-[2px]" style={{ background: 'var(--color-secondary)' }} />
          {events.map((ev, idx) => (
            <div key={idx} className="mb-8">
              <div className="flex items-start gap-4">
                <div className="mt-1 w-3 h-3 rounded-full" style={{ background: 'var(--color-primary)' }} />
                <div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--color-textPrimary)' }}>{ev.date || ev.label}</div>
                  {ev.title && (
                    <div className="text-base font-medium" style={{ color: 'var(--color-textPrimary)' }}>{ev.title}</div>
                  )}
                  {ev.description && (
                    <div className="text-sm opacity-80" style={{ color: 'var(--color-textSecondary)' }}>{ev.description}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
