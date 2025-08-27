'use client';

import { motion } from 'framer-motion';

export function ComparisonTable({ title, items = [], criteria = [], animated }) {
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
        <h2 className="text-5xl font-bold mb-8 text-center" style={{ color: 'var(--color-textPrimary)' }}>
          {title}
        </h2>
      )}

      {!isMatrix ? (
        <div className="grid grid-cols-2 gap-8 w-full">
          {items.slice(0, 2).map((col, idx) => (
            <div key={idx} className="p-6 rounded-xl backdrop-blur" style={{ background: 'var(--token-glassBackgroundColor)', border: `1px solid var(--token-glassBorderColor)` }}>
              <div className="text-xl font-semibold mb-4" style={{ color: 'var(--color-textPrimary)' }}>{col.name || col.title || (idx === 0 ? 'Option A' : 'Option B')}</div>
              {Array.isArray(col.pros) && (
                <ul className="mb-4 list-disc list-inside text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  {col.pros.map((p, i) => (<li key={i}>{p}</li>))}
                </ul>
              )}
              {Array.isArray(col.cons) && (
                <ul className="list-disc list-inside text-sm opacity-80" style={{ color: 'var(--color-textSecondary)' }}>
                  {col.cons.map((c, i) => (<li key={i}>{c}</li>))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2" />
                {items.map((it, idx) => (
                  <th key={idx} className="px-4 py-2" style={{ color: 'var(--color-textPrimary)' }}>{it.name || it.title || `Option ${idx+1}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((crit, r) => (
                <tr key={r} className="border-t border-white/10">
                  <td className="px-4 py-2" style={{ color: 'var(--color-textSecondary)' }}>{crit}</td>
                  {items.map((it, c) => (
                    <td key={c} className="px-4 py-2" style={{ color: 'var(--color-textPrimary)' }}>
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
