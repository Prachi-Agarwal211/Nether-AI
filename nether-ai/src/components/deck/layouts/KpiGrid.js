'use client';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SlideWrapper } from './SlideWrapper';

export function KpiGrid({ title, kpis = [], animated }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 100 } }
  };
  
  return (
    <SlideWrapper title={title} animated={animated}>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {(kpis && kpis.length > 0) ? kpis.map((kpi, i) => {
          const isPositive = parseFloat(kpi.change) >= 0;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="p-6 rounded-xl"
              style={{ 
                background: 'var(--token-glassBackgroundColor, rgba(255,255,255,0.05))', 
                border: '1px solid var(--token-glassBorderColor, rgba(255,255,255,0.1))' 
              }}
            >
              <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>{kpi.label || 'Metric'}</div>
              <div className="text-4xl font-bold mb-3">{kpi.value}</div>
              {kpi.change && (
                <div className="flex items-center text-sm" style={{ color: isPositive ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                  {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  {kpi.change}
                </div>
              )}
            </motion.div>
          );
        }) : (
          <div className="col-span-3 text-center text-lg">No KPI data provided for this slide.</div>
        )}
      </motion.div>
    </SlideWrapper>
  );
}
