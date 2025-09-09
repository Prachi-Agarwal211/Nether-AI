'use client';
import { motion } from 'framer-motion';
import { Zap, BarChart, Rocket, Circle, Check } from 'lucide-react';
import { SlideWrapper } from './SlideWrapper';

const icons = { Zap, BarChart, Rocket, Circle, Check };

export function FeatureGrid({ title, features = [], animated, variant = 'standard' }) {
  const renderVariant = () => {
    switch (variant) {
      case 'pills':
        return (
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-4 justify-center">
              {(features || []).map((feature, i) => (
                <motion.div
                  key={i}
                  className="px-6 py-3 rounded-full"
                  style={{
                    background: 'var(--token-glassBackgroundColor)',
                    border: '1px solid var(--token-glassBorderColor)'
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <div className="flex items-center gap-3">
                    {feature.icon && (
                      <div className="p-1.5 rounded-full" style={{ background: 'var(--color-primary-main)20' }}>
                        {React.createElement(icons[feature.icon] || Check, { 
                          className: 'w-4 h-4', 
                          style: { color: 'var(--color-primary-main)' } 
                        })}
                      </div>
                    )}
                    <span>{feature.title}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'large-icons':
        return (
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(features || []).map((feature, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <div className="p-4 mb-4 rounded-xl" style={{ background: 'var(--color-primary-main)10' }}>
                    {React.createElement(icons[feature.icon] || Circle, {
                      className: 'w-8 h-8',
                      style: { color: 'var(--color-primary-main)' }
                    })}
                  </div>
                  <h3 className="text-lg font-medium">{feature.title}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        );

      default: // standard
        return (
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(features || []).map((feature, i) => (
                <motion.div
                  key={i}
                  className="p-6 rounded-xl"
                  style={{
                    background: 'var(--token-glassBackgroundColor)',
                    border: '1px solid var(--token-glassBorderColor)'
                  }}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 * i }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {feature.icon && (
                      <div className="p-2 rounded-lg" style={{ background: 'var(--color-primary-main)20' }}>
                        {React.createElement(icons[feature.icon] || Check, {
                          className: 'w-5 h-5',
                          style: { color: 'var(--color-primary-main)' }
                        })}
                      </div>
                    )}
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
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
