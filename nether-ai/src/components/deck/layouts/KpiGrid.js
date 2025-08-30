'use client';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function KpiGrid({ title, kpis = [], animated }) {
  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 100 } }
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
          className="text-5xl font-bold mb-12 text-center"
          style={{ color: 'var(--color-textPrimary)' }}
        >
          {title}
        </motion.h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {(kpis || []).map((kpi, i) => {
          const isPositive = parseFloat(kpi.change) >= 0;
          return (
            <motion.div
              key={i}
              variants={animated ? itemVariants : undefined}
              className="p-6 rounded-xl"
              style={{ background: 'var(--token-glassBackgroundColor)', border: `1px solid var(--token-glassBorderColor)` }}
            >
              <div className="text-sm text-white/70 mb-2">{kpi.label}</div>
              <div className="text-4xl font-bold text-white mb-3">{kpi.value}</div>
              {kpi.change && (
                <div className={`flex items-center text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  {kpi.change}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
