'use client';

import { motion } from 'framer-motion';

export function TeamMembers({ title, members = [], animated }) {
  return (
    <motion.div
      className="w-full h-full p-16 flex flex-col items-center justify-center"
      initial={animated ? { opacity: 0, y: 20 } : false}
      animate={animated ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.4 }}
    >
      {title && (
        <h2 className="text-5xl font-bold mb-10 text-center" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h2>
      )}

      <div className="grid grid-cols-3 gap-10 w-full">
        {members.map((m, idx) => (
          <div 
            key={idx} 
            className="flex flex-col items-center text-center p-6 rounded-2xl backdrop-blur"
            style={{
              background: 'var(--token-glassBackgroundColor)',
              border: '1px solid var(--token-glassBorderColor)',
              boxShadow: 'var(--token-cardShadow)',
              borderRadius: 'var(--token-borderRadius)'
            }}
          >
            {m.photoUrl && (
              <img src={m.photoUrl} alt={m.name} className="w-24 h-24 rounded-full object-cover mb-4" />
            )}
            <div className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{m.name || 'Member'}</div>
            {m.role && (
              <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>{m.role}</div>
            )}
            {m.bio && (
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{m.bio}</div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
