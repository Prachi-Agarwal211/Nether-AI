'use client';
import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';

// Helper to safely render a value that might be a string or an object
const renderContent = (content) => {
  if (typeof content === 'string') return content;
  if (typeof content === 'object' && content !== null) {
    return content.point || content.item || content.description || '';
  }
  return '';
};

export function TwoColumn({ 
  title, 
  body, 
  bullets = [], 
  imageUrl, 
  animated, 
  variant = 'standard',
  imagePosition = 'right' 
}) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const renderVariant = () => {
    switch (variant) {
      case 'cards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
            <motion.div 
              className="space-y-6"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {body && <p className="text-lg opacity-80">{body}</p>}
              {(bullets.length > 0) ? bullets.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="p-4 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-primary-main)' }}>
                    {typeof item === 'string' ? `Point ${index + 1}` : item.title || `Point ${index + 1}`}
                  </h3>
                  <p className="text-sm opacity-80">
                    {renderContent(item)}
                  </p>
                </motion.div>
              )) : null}
            </motion.div>
            <motion.div 
              className="rounded-xl overflow-hidden h-64 md:h-full"
              variants={itemVariants}
            >
              {imageUrl && (
                <img src={imageUrl} alt={title || ''} className="w-full h-full object-cover" />
              )}
            </motion.div>
          </div>
        );

      case 'split':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl">
            <motion.div 
              className="space-y-6"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {body && <p className="text-lg opacity-80">{body}</p>}
              {(bullets.length > 0) ? bullets.map((item, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-4"
                >
                  <div className="w-6 h-6 rounded-full flex-shrink-0 mt-1" style={{ background: 'var(--color-primary-main)' }} />
                  <span>{renderContent(item)}</span>
                </motion.li>
              )) : null}
            </motion.div>
            <motion.div 
              className="rounded-xl overflow-hidden h-64 md:h-full"
              variants={itemVariants}
            >
              {imageUrl && (
                <img src={imageUrl} alt={title || ''} className="w-full h-full object-cover" />
              )}
            </motion.div>
          </div>
        );

      default: // standard
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl">
            <motion.div 
              className="space-y-6"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {body && <p className="text-lg opacity-80">{body}</p>}
              {(bullets.length > 0) ? bullets.map((item, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-4 text-xl"
                >
                  <span className="text-primary-main">✦</span>
                  <span>{renderContent(item)}</span>
                </motion.li>
              )) : null}
            </motion.div>
            <motion.div 
              className="rounded-xl overflow-hidden h-64 md:h-full"
              variants={itemVariants}
            >
              {imageUrl && (
                <img src={imageUrl} alt={title || ''} className="w-full h-full object-cover" />
              )}
            </motion.div>
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
