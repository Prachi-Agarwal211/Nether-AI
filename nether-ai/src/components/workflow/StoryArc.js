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

const SlideNode = ({ slide, index }) => {
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.94, y: 8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 16, stiffness: 140 } }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -6, scale: 1.02, boxShadow: '0 10px 30px rgba(255, 225, 198, 0.10)' }}
      className="relative glass-card p-6 border border-white/10 rounded-xl"
    >
      <div className="flex justify-between items-start mb-3 gap-3">
        <h3 className="text-lg md:text-xl font-medium text-white/90">
          <span className="text-peachSoft pr-2">#{index + 1}</span>
          {slide.slide_title}
        </h3>
        {slide.visual_element?.type && (
          <div className="flex items-center gap-2 text-xs text-white/70 bg-white/5 px-2 py-1 rounded-md border border-white/10">
            <VisualIcon type={slide.visual_element.type} />
            <span className="truncate max-w-[160px]">{slide.visual_element.type}</span>
          </div>
        )}
      </div>
      {slide.objective && (
        <div className="text-xs text-white/60 mb-2">Objective: {slide.objective}</div>
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
  );
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
          {/* Thinner, softer timeline */}
          <div className="absolute left-[24px] top-0 w-0.5 h-full bg-gradient-to-b from-white/25 via-white/10 to-transparent" />
        </div>
        <motion.div
          className="space-y-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {blueprint.slides.map((slide, index) => (
            <div key={slide.slide_id || index} className="relative pl-16">
              {/* Smaller pulsing node */}
              <div className="absolute left-[19px] top-8 w-2.5 h-2.5 rounded-full bg-white/80 ring-4 ring-white/10 animate-pulse" />
              {/* Refined card with stronger hierarchy */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="relative glass-card p-6 border border-white/10 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-black/30"
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
