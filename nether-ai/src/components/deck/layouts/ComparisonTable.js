'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { SlideWrapper } from './SlideWrapper';

export function ComparisonTable({ title, items = [], animated }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 15, stiffness: 100 } }
  };

  return (
    <SlideWrapper title={title} animated={animated}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        {(items || []).slice(0, 2).map((col, idx) => (
          <motion.div 
            key={idx} 
            variants={itemVariants}
            className="p-6 rounded-2xl" 
            style={{ 
              background: 'var(--token-glassBackgroundColor, rgba(255,255,255,0.05))',
              border: '1px solid var(--token-glassBorderColor, rgba(255,255,255,0.1))'
            }}
          >
            <div className="text-2xl font-semibold mb-6 text-center" style={{ color: 'var(--color-text-primary)' }}>
              {col.name || col.title}
            </div>
            
            {Array.isArray(col.pros) && col.pros.length > 0 && (
              <ul className="space-y-3 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                {col.pros.map((pro, i) => (
                  <li key={`pro-${i}`} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-success-main, #22c55e)' }} />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            )}

            {Array.isArray(col.cons) && col.cons.length > 0 && (
              <ul className="space-y-3 opacity-80" style={{ color: 'var(--color-text-secondary)' }}>
                {col.cons.map((con, i) => (
                  <li key={`con-${i}`} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-danger-main, #ef4444)' }} />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
    </SlideWrapper>
  );
}
