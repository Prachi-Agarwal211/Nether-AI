'use client';

import { motion } from 'framer-motion';
import { Layers, Image as ImageIcon, MessageSquare, List } from 'lucide-react';

// Visual type to icon mapper
const VisualIcon = ({ type }) => {
  const t = (type || '').toLowerCase();
  if (t.includes('image')) return <ImageIcon className="w-4 h-4 text-white/60" />;
  if (t.includes('diagram')) return <Layers className="w-4 h-4 text-white/60" />;
  if (t.includes('quote')) return <MessageSquare className="w-4 h-4 text-white/60" />;
  return <List className="w-4 h-4 text-white/60" />;
};

export default function StoryArc({ blueprint }) {
  if (!blueprint || !blueprint.slides) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Fixed header for the topic */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="text-[11px] uppercase tracking-widest text-white/50 mb-1">Topic</div>
        <h1 className="font-sans font-medium text-white/90 text-2xl md:text-3xl tracking-normal">{blueprint.topic}</h1>
      </div>

      {/* Scrollable outline area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="relative" aria-hidden>
          {/* Enhanced timeline with gradient and glow */}
          <div className="absolute left-[24px] top-0 w-1 h-full bg-gradient-to-b from-peachSoft/60 via-white/30 to-transparent shadow-lg shadow-peachSoft/20" />
        </div>
        <motion.div
          className="space-y-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {blueprint.slides.map((slide, index) => (
            <div key={slide.slide_id || index} className="relative pl-16">
              {/* Enhanced pulsing node */}
              <div className="absolute left-[20px] top-8 w-3 h-3 rounded-full bg-gradient-to-r from-peachSoft to-mauveLight shadow-lg shadow-peachSoft/50 animate-pulse ring-2 ring-white/20" />
              {/* Enhanced card with theme colors */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -4, scale: 1.01, borderColor: 'var(--color-primary)' }}
                className="relative glass-card p-6 border-2 border-transparent hover:border-peachSoft/30 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-peachSoft/10"
              >
                <div className="flex justify-between items-start mb-3 gap-3">
                  <h3 className="flex items-baseline gap-3 text-xl md:text-2xl">
                    <span className="mother-of-pearl-text text-2xl md:text-3xl">#{index + 1}</span>
                    <span className="font-sans font-medium text-white/90">{slide.slide_title}</span>
                  </h3>
                  {slide.visual_element?.type && (
                    <div className="flex items-center gap-2 text-xs text-white/70 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                      <VisualIcon type={slide.visual_element.type} />
                      <span className="truncate max-w-[160px]">{slide.visual_element.type}</span>
                    </div>
                  )}
                </div>
                {slide.objective && (
                  <p className="mb-4 text-xs text-white/60 pl-1 italic">{slide.objective}</p>
                )}
                <motion.ul
                  className="list-disc pl-5 space-y-2 text-white/90"
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                >
                  {(slide.content_points || []).map((point, i) => (
                    <motion.li key={i} variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }} className="text-sm">
                      {point}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
