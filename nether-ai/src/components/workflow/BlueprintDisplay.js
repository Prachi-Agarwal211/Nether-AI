'use client';

import { motion } from 'framer-motion';
import { Layers, Image as ImageIcon, MessageSquare, List } from 'lucide-react';

// Map visual element types to an icon
const VisualIcon = ({ type }) => {
  const t = (type || '').toLowerCase();
  if (t.includes('image')) return <ImageIcon className="w-4 h-4 text-white/60" />;
  if (t.includes('diagram')) return <Layers className="w-4 h-4 text-white/60" />;
  if (t.includes('quote')) return <MessageSquare className="w-4 h-4 text-white/60" />;
  return <List className="w-4 h-4 text-white/60" />; // default for text layouts
};

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
      <h1 className="font-sans font-medium text-white/90 text-2xl md:text-3xl">{blueprint.topic}</h1>
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
            <div className="flex items-start justify-between mb-3 gap-3">
              <h3 className="text-lg md:text-xl font-medium text-white/90">
                Slide {index + 1}: {slide.slide_title}
              </h3>
              {slide.visual_element?.type && (
                <div className="flex items-center gap-2 text-xs text-white/70 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                  <VisualIcon type={slide.visual_element.type} />
                  <span className="truncate max-w-[160px]">{slide.visual_element.type}</span>
                </div>
              )}
            </div>
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
