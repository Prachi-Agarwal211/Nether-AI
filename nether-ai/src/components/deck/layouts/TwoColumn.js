'use client';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeProvider';

// Helper to safely render a value that might be a string or an object
const renderContent = (content) => {
  if (typeof content === 'string') return content;
  if (typeof content === 'object' && content !== null) {
    return content.point || content.item || JSON.stringify(content);
  }
  return '';
};

export function TwoColumn({ title, body, bullets, imageUrl, animated, imagePosition = 'right' }) {
  const theme = useTheme();
  const hasGlassEffect = theme.designBrief?.backgroundSystem?.recipes?.glass;
  
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
        {title && <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>}
        {body && <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>{body}</p>}
        {!!(bullets && bullets.length) && (
          <ul className="space-y-3">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-3 mt-1" style={{ color: 'var(--color-primary-main)' }}>✦</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{renderContent(bullet)}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
      <motion.div
        className={`${imageOrder} h-64 md:h-full w-full rounded-[var(--border-radius-large)] overflow-hidden ${hasGlassEffect ? 'glass-effect' : ''}`}
        style={{
          backgroundColor: hasGlassEffect 
            ? 'var(--glass-background-color)' 
            : 'var(--color-background-default)',
          border: hasGlassEffect
            ? '1px solid var(--glass-border-color)'
            : '1px solid var(--color-border-default)'
        }}
        variants={animated ? rightVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={title || 'presentation image'} className="w-full h-full object-cover" />
        )}
      </motion.div>
    </div>
  );
}
