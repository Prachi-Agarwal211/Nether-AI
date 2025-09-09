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
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="h-full w-full flex flex-col glass-card">
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="text-[11px] uppercase tracking-widest text-white/50 mb-1">Topic</div>
        <h1 className="font-sans font-medium text-white/90 text-2xl md:text-3xl tracking-normal text-heading-glow">{blueprint.topic}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          className="relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="absolute left-6 top-2 h-full w-0.5 bg-gradient-to-b from-peachSoft/50 via-white/20 to-transparent" aria-hidden="true" />
          
          <div className="space-y-4">
            {blueprint.slides.map((slide, index) => (
              <motion.div
                key={slide.slide_id || index}
                variants={itemVariants}
                className="relative pl-16 group"
              >
                <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-black border-2 border-peachSoft flex items-center justify-center ring-4 ring-black">
                    <div className="w-1.5 h-1.5 bg-peachSoft rounded-full transition-transform duration-300 group-hover:scale-150" />
                </div>
                
                <div className="border-l-2 border-white/10 group-hover:border-peachSoft transition-colors duration-300">
                    <div className="p-4 bg-transparent group-hover:bg-white/5 rounded-r-lg transition-colors duration-300">
                        <div className="flex items-start justify-between mb-2 gap-3">
                            <h3 className="text-lg font-semibold text-white/90">
                            {index + 1}. {slide.slide_title}
                            </h3>
                            {slide.visual_element?.type && (
                            <div className="text-xs text-white/70 bg-white/5 px-2 py-1 rounded-full border border-white/10 whitespace-nowrap">
                                {slide.visual_element.type}
                            </div>
                            )}
                        </div>
                        
                        {slide.slide_summary && (
                          <p className="text-sm text-white/70 mb-3 font-light italic">
                            {slide.slide_summary}
                          </p>
                        )}
                        
                        <ul className="pl-1 space-y-1.5 text-white/70 text-sm font-light">
                            {(slide.content_points || []).map((point, i) => (
                            <li key={i} className="relative pl-4 before:content-['▸'] before:absolute before:left-0 before:top-0 before:text-peachSoft">
                                {point}
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
