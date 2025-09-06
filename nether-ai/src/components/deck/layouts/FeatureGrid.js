'use client';
import { motion } from 'framer-motion';
import { Zap, BarChart, Rocket } from 'lucide-react';

const icons = { Zap, BarChart, Rocket };

export function FeatureGrid({ title, features = [], animated, recipe }) {
  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 100 } }
  };

  // Dynamic grid classes based on feature count
  const gridClasses = () => {
    const count = features.length;
    if (count <= 2) return 'grid-cols-1 md:grid-cols-2';
    if (count === 3) return 'grid-cols-1 md:grid-cols-3';
    if (count === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  const accent1 = recipe?.theme_runtime?.accent || 'var(--color-primary-accent)';
  const accent2 = recipe?.theme_runtime?.secondary_accent || 'var(--color-secondary-accent)';

  return (
    <motion.div
      className="w-full h-full p-16 flex flex-col items-center justify-center"
      variants={animated ? containerVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
    >
      {title && (
        <motion.h2 
          className="text-5xl font-bold mb-12 text-center" 
          variants={animated ? itemVariants : undefined}
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </motion.h2>
      )}
      <div className={`w-full grid ${gridClasses()} gap-8`}>
        {(features || []).map((feature, i) => {
          const Icon = icons[feature.icon] || Zap;
          return (
            <motion.div
              key={i}
              variants={animated ? itemVariants : undefined}
              className="group relative p-6 rounded-xl backdrop-blur overflow-hidden"
              style={{
                background: 'var(--token-glassBackgroundColor)',
                border: '1px solid var(--token-glassBorderColor)'
              }}
            >
              <div
                className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(400px at center, ${accent1}20, transparent)` }}
              />

              <div className="relative z-10">
                <div 
                  className="p-3 w-min rounded-lg mb-4" 
                  style={{
                    background: `linear-gradient(135deg, ${accent1}40, ${accent2}40)`
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: accent1 }} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>{feature.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>{feature.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
