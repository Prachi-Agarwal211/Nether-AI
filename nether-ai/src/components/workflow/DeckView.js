'use client';
import { usePresentationStore } from '@/store/usePresentationStore';
import ResponsiveCanvas from '../deck/ResponsiveCanvas';
import SlideRenderer from '../deck/SlideRenderer';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft, PanelRight, ChevronLeft, ChevronRight } from 'lucide-react';
import DeckAICopilot from '../deck/DeckAICopilot';

export default function DeckView() {
  const { presentation, setActiveSlideIndex } = usePresentationStore();
  const { slideRecipes, activeSlideIndex } = presentation;
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false); // default closed

  const activeRecipe = slideRecipes[activeSlideIndex];

  return (
    <div className="flex h-[calc(100vh-150px)] w-full gap-2">
      {/* Collapsible Left Thumbnail Navigator */}
      <motion.div
        animate={{ width: isLeftPanelOpen ? 240 : 0, opacity: isLeftPanelOpen ? 1 : 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="border border-white/15 rounded-lg overflow-hidden"
      >
        <div className="p-2 space-y-3 overflow-y-auto w-[240px] h-full">
          {slideRecipes.map((recipe, index) => (
            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              key={recipe.slide_id || index}
              onClick={() => setActiveSlideIndex(index)}
              className={`w-full p-2 rounded-md text-left transition-colors text-white ${
                index === activeSlideIndex ? 'bg-white/10 ring-1 ring-white/30' : 'hover:bg-white/10'
              }`}
            >
              {/* PPT-like thumbnail preview */}
              <div className="w-full aspect-video bg-transparent border border-white/15 rounded md overflow-hidden mb-2">
                <div className="w-full h-full p-1">
                  <div className="w-full h-full overflow-hidden rounded-sm">
                    <div className="w-full h-[120px]">
                      <ResponsiveCanvas>
                        <SlideRenderer recipe={recipe} />
                      </ResponsiveCanvas>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs text-white/70">Slide {index + 1}</span>
              <p className="text-sm truncate font-semibold mother-of-pearl-text">{recipe.props?.title || 'Untitled'}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Center Stage with Filmstrip */}
      <div className="flex-1 flex flex-col h-full relative">
        <div className="flex items-center gap-2 px-2 py-1">
          <button onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)} className="p-2 rounded hover:bg-white/10 text-white">
            <PanelLeft size={18} />
          </button>
          <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className="p-2 rounded hover:bg-white/10 ml-auto text-white">
            <PanelRight size={18} />
          </button>
        </div>
        <div className="flex-1 relative">
          <ResponsiveCanvas>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlideIndex}
                initial={{ opacity: 0, y: 10, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 1.005 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-full h-full"
              >
                <SlideRenderer recipe={activeRecipe} />
              </motion.div>
            </AnimatePresence>
          </ResponsiveCanvas>
        </div>
        {/* Bottom Filmstrip / Navigation */}
        <div className="flex-shrink-0 h-24 p-2">
          <div className="w-full h-full glass-card flex items-center justify-between px-4 rounded-lg border border-white/15 text-white">
            <button
              onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
              className="glass-button p-3 rounded-full text-white"
            >
              <ChevronLeft />
            </button>
            <div className="text-sm font-medium">Slide {activeSlideIndex + 1} / {slideRecipes.length}</div>
            <button
              onClick={() => setActiveSlideIndex(Math.min(slideRecipes.length - 1, activeSlideIndex + 1))}
              className="glass-button p-3 rounded-full text-white"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Right Editor Panel (AI Copilot / Theme) */}
      <motion.div
        animate={{ width: isRightPanelOpen ? 320 : 0, opacity: isRightPanelOpen ? 1 : 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="border border-white/15 rounded-lg overflow-hidden"
      >
        <div className="relative w-[320px] h-full">
          <DeckAICopilot isOpen={true} onToggle={() => setIsRightPanelOpen(!isRightPanelOpen)} />
        </div>
      </motion.div>
    </div>
  );
}
