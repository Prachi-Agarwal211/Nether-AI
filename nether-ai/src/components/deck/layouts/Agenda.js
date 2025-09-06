'use client';

import { motion } from 'framer-motion';
import { useTheme } from '../ThemeProvider';

// Helper to safely render a value that might be a string or an object
const renderContent = (content) => {
  if (typeof content === 'string') return content;
  if (typeof content === 'object' && content !== null) {
    // Try to access common keys AI might generate
    return content.point || content.item || JSON.stringify(content);
  }
  return '';
};

export function Agenda({ title = 'Agenda', items = [], animated }) {
  const theme = useTheme();
  const hasGradient = theme.designBrief?.typography?.textEffects?.headingGradient;
  
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 15, stiffness: 100 } }
  };

  return (
    <motion.div
      className="w-full h-full p-16 flex flex-col justify-center"
      variants={animated ? containerVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
      style={{ '--spacing-unit': 'var(--spacing-unit, 8px)' }}
    >
      <motion.h2
        initial={animated ? { opacity: 0 } : false}
        animate={animated ? { opacity: 1 } : false}
        transition={{ duration: 0.5 }}
        className={`text-6xl font-bold mb-[calc(var(--spacing-unit)*6)] ${hasGradient ? 'heading-gradient' : ''}`}
        style={{
          color: hasGradient ? undefined : 'var(--color-text-primary)',
          '--heading-gradient-colors': hasGradient 
            ? theme.designBrief.typography.textEffects.headingGradient.colors
              .map(color => `var(--color-${color})`)
              .join(', ')
            : undefined
        }}
      >
        {title}
      </motion.h2>
      
      <ul className="space-y-[calc(var(--spacing-unit)*2)]">
        {(items || []).map((item, index) => (
          <motion.li
            key={index}
            variants={itemVariants}
            className="flex items-center gap-[calc(var(--spacing-unit)*2)] text-[calc(var(--spacing-unit)*3)]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <span
              className="font-semibold text-[calc(var(--spacing-unit)*4)]"
              style={{ color: 'var(--color-primary-main)' }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{renderContent(item)}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
