'use client';

import { motion } from 'framer-motion';

export default function BlueprintDisplay({ blueprint }) {
  if (!blueprint || !blueprint.slides) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mother-of-pearl-text">{blueprint.topic}</h1>
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {blueprint.slides.map((slide, index) => (
          <motion.div
            key={slide.slide_id || index}
            variants={itemVariants}
            className="bg-black/20 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-peachSoft mb-3">
              Slide {index + 1}: {slide.slide_title}
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-white/90">
              {(slide.content_points || []).map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
