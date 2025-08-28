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

  const accent1 = recipe?.theme_runtime?.accent || 'var(--accent-primary)';
  const accent2 = recipe?.theme_runtime?.secondary_accent || 'var(--accent-secondary)';

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
          className="text-6xl font-extrabold mb-16 bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(90deg, ${accent1}, ${accent2})`}}
        >
          {title}
        </motion.h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {(features || []).map((feature, i) => {
          const Icon = icons[feature.icon] || Zap;
          return (
            <motion.div
              key={i}
              variants={animated ? itemVariants : undefined}
              className="group relative p-6 glass-card overflow-hidden"
            >
              <div
                className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(400px at center, ${accent1}20, transparent)`}}
              />

              <div className="relative z-10">
                <div className="p-3 w-min rounded-lg mb-4" style={{background: `linear-gradient(135deg, ${accent1}40, ${accent2}40)`}}>
                  <Icon className="w-6 h-6" style={{ color: accent1 }} />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
