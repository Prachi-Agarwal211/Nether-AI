'use client';

import { motion } from 'framer-motion';
import { useTheme } from '../ThemeProvider';

export function ComparisonTable({ title, items = [], criteria = [], animated }) {
  const theme = useTheme();
  const hasGlassEffect = theme.designBrief?.backgroundSystem?.recipes?.glass;
  
  // items: [{ name: 'Option A', pros: [...], cons: [...] }] OR [{ left: 'X', right: 'Y', label: '...' }]
  const isMatrix = Array.isArray(criteria) && criteria.length > 0;

  return (
    <motion.div
      className="w-full h-full p-16 flex flex-col items-center justify-center"
      initial={animated ? { opacity: 0, y: 20 } : false}
      animate={animated ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.4 }}
    >
      {title && (
        <h2 className="text-5xl font-bold mb-8 text-center" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h2>
      )}

      {!isMatrix ? (
        <div className="grid grid-cols-2 gap-8 w-full">
          {items.slice(0, 2).map((col, idx) => (
            <div 
              key={idx} 
              className={`p-6 rounded-[var(--border-radius-large)] ${hasGlassEffect ? 'glass-effect' : ''}`} 
              style={{ 
                background: hasGlassEffect 
                  ? 'var(--glass-background-color)' 
                  : 'var(--color-background-paper)',
                border: hasGlassEffect
                  ? '1px solid var(--glass-border-color)'
                  : '1px solid var(--color-border-default)'
              }}
            >
              <div className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                {col.name || col.title || (idx === 0 ? 'Option A' : 'Option B')}
              </div>
              {Array.isArray(col.pros) && (
                <ul className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  {col.pros.map((p, i) => (
                    <li key={i} className="flex items-start mb-2">
                      <span className="mr-2" style={{ color: 'var(--color-success-main)' }}>✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              )}
              {Array.isArray(col.cons) && (
                <ul className="opacity-80" style={{ color: 'var(--color-text-secondary)' }}>
                  {col.cons.map((c, i) => (
                    <li key={i} className="flex items-start mb-2">
                      <span className="mr-2" style={{ color: 'var(--color-danger-main)' }}>✗</span>
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-[720px] w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-2" />
                {items.map((it, idx) => (
                  <th 
                    key={idx} 
                    className="px-4 py-2" 
                    style={{ 
                      color: 'var(--color-text-primary)',
                      borderBottom: '1px solid var(--color-border-default)'
                    }}
                  >
                    {it.name || it.title || `Option ${idx+1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((crit, r) => (
                <tr 
                  key={r} 
                  style={{ 
                    borderTop: '1px solid var(--color-border-default)',
                    backgroundColor: r % 2 === 0 ? 'var(--color-background-default)' : 'var(--color-background-paper)'
                  }}
                >
                  <td 
                    className="px-4 py-2 font-medium" 
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {crit}
                  </td>
                  {items.map((it, c) => (
                    <td 
                      key={c} 
                      className="px-4 py-2" 
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {it.values ? it.values[r] : it[crit]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
