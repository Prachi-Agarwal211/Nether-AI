'use client';

import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import { CheckCircle } from 'lucide-react';

// This component now acts as a renderer for multiple visual styles.
export function TitleAndBulletsLayout({ title, body, bullets = [], animated, variant = 'standard' }) {

  // A helper to safely render bullet content
  const renderBulletContent = (item) => {
    if (typeof item === 'string') return item;
    return item.title || item.description || '';
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const renderVariant = () => {
    switch (variant) {
      case 'cards':
        return (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {(bullets.length > 0) ? bullets.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 text-left rounded-xl h-full"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-primary-main)' }}>{item.title || `Point ${index + 1}`}</h3>
                <p className="text-sm opacity-80">{item.description}</p>
              </motion.div>
            )) : <div className="col-span-3 text-center">No points provided for this slide.</div>}
          </motion.div>
        );

      case 'numbered-icons':
        return (
          <div className="w-full max-w-3xl text-left space-y-6">
            {body && <p className="mb-8 text-lg opacity-80 text-center">{body}</p>}
            {(bullets.length > 0) ? bullets.map((item, index) => (
              <motion.div key={index} variants={itemVariants} className="flex items-start gap-4">
                <div 
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg"
                  style={{ background: 'var(--color-primary-main)', color: 'var(--color-background-default)' }}
                >
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-xl">{item.title}</h3>
                  <p className="opacity-80">{item.description}</p>
                </div>
              </motion.div>
            )) : <div className="text-center">No points provided for this slide.</div>}
          </div>
        );

      // Default to a clean, standard list
      default:
        return (
          <div className="w-full max-w-3xl text-left">
            {body && <p className="mb-8 text-lg opacity-80">{body}</p>}
            <ul className="space-y-4">
              {(bullets.length > 0) ? bullets.map((item, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-4 text-xl"
                >
                  <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary-main)' }} />
                  <span>{renderBulletContent(item)}</span>
                </motion.li>
              )) : <li>No points provided for this slide.</li>}
            </ul>
          </div>
        );
    }
  };

  return (
    <SlideWrapper title={title} animated={animated}>
      {renderVariant()}
    </SlideWrapper>
  );
}
