'use client';
import { usePresentationStore } from '@/store/usePresentationStore';
import ResponsiveCanvas from '../deck/ResponsiveCanvas';
import SlideRenderer from '../deck/SlideRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DeckAICopilot from '../deck/DeckAICopilot';

export default function DeckView() {
  const { presentation, setActiveSlideIndex } = usePresentationStore();
  const { slideRecipes, activeSlideIndex } = presentation;

  const activeRecipe = slideRecipes[activeSlideIndex];

  return (
    // Main container for the 3-panel layout, using flexbox for structure
    <div className="flex h-[calc(100vh-150px)] w-full gap-4">

      {/* Panel 1: Left Thumbnail Navigator (The "Filmstrip") */}
      <div className="w-60 flex-shrink-0 bg-black/20 border border-white/10 rounded-xl p-2">
        <div className="h-full overflow-y-auto space-y-3">
          {slideRecipes.map((recipe, index) => (
            <button
              key={recipe.slide_id || index}
              onClick={() => setActiveSlideIndex(index)}
              className={`w-full p-1 rounded-lg transition-all duration-200 ${
                index === activeSlideIndex ? 'bg-white/10 ring-2 ring-peachSoft' : 'hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/60 w-6 text-center">{index + 1}</span>
                <div className="w-full aspect-video bg-transparent border border-white/15 rounded-md overflow-hidden">
                  {/* Miniature, non-animated preview */}
                  <ResponsiveCanvas>
                    <SlideRenderer recipe={recipe} animated={false} />
                  </ResponsiveCanvas>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Panel 2: Center Stage (The Main Canvas) */}
      <div className="flex-1 flex flex-col min-w-0"> {/* min-w-0 is a key flexbox fix */}
        <div className="flex-1 w-full h-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlideIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              {/* This canvas will now respect its container's bounds perfectly */}
              <ResponsiveCanvas>
                <SlideRenderer recipe={activeRecipe} animated={true} />
              </ResponsiveCanvas>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Bottom Navigation Bar */}
        <div className="flex-shrink-0 flex items-center justify-center gap-4 p-4">
          <button
            onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
            className="glass-button p-3 rounded-full text-white disabled:opacity-50"
            disabled={activeSlideIndex === 0}
          >
            <ChevronLeft />
          </button>
          <div className="text-sm font-medium text-white/80">
            Slide {activeSlideIndex + 1} / {slideRecipes.length}
          </div>
          <button
            onClick={() => setActiveSlideIndex(Math.min(slideRecipes.length - 1, activeSlideIndex + 1))}
            className="glass-button p-3 rounded-full text-white disabled:opacity-50"
            disabled={activeSlideIndex === slideRecipes.length - 1}
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Panel 3: Right AI Co-pilot & Editor */}
      <div className="w-80 flex-shrink-0">
        <DeckAICopilot activeSlide={activeRecipe} />
      </div>

    </div>
  );
}
