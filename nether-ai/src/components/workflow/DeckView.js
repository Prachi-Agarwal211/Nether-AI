'use client';
import { useMemo, useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { usePresentationStore } from '@/store/usePresentationStore';
import ResponsiveCanvas from '../deck/ResponsiveCanvas';
import SlideRenderer from '../deck/SlideRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft, PanelRight, ChevronLeft, ChevronRight } from 'lucide-react';
import DeckAICopilot from '../deck/DeckAICopilot';

export default function DeckView() {
  const { isLoading } = useUIStore();
  const { presentation, setActiveSlideIndex } = usePresentationStore();
  const { slideRecipes = [], activeSlideIndex = 0 } = presentation || {};
  const totalSlides = presentation?.blueprint?.slides?.length || slideRecipes.length || 0;
  const activeRecipe = useMemo(() => (
    Array.isArray(slideRecipes) && activeSlideIndex < slideRecipes.length ? slideRecipes[activeSlideIndex] : null
  ), [slideRecipes, activeSlideIndex]);

  // Panel visibility state
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const panelVariants = { open: { x: 0, opacity: 1 }, closed: { x: '-100%', opacity: 0 } };
  const rightPanelVariants = { open: { x: 0, opacity: 1 }, closed: { x: '100%', opacity: 0 } };

  return (
    // Designer's Cockpit: layered layout
    <div className="h-full w-full flex flex-col relative overflow-hidden">

      {/* Top toolbar toggles */}
      <div className="absolute top-2 left-2 right-2 z-30 flex justify-between items-center gap-2">
        <button onClick={() => setIsLeftPanelOpen(v => !v)} className="glass-button p-3 rounded-full text-white">
          <PanelLeft size={18} />
        </button>
        <button onClick={() => setIsRightPanelOpen(v => !v)} className="glass-button p-3 rounded-full text-white">
          <PanelRight size={18} />
        </button>
      </div>

      {/* Center Stage (canvas-first) */}
      <div className="flex-grow w-full h-full p-8 md:p-12 lg:p-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlideIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            <ResponsiveCanvas>
              {activeRecipe ? (
                <SlideRenderer recipe={activeRecipe} animated={true} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/60">
                  {totalSlides > 0 ? (isLoading ? `Generating Slide ${activeSlideIndex + 1}...` : 'Select a slide to view.') : 'No slides yet'}
                </div>
              )}
            </ResponsiveCanvas>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Filmstrip & Navigation */}
      <div className="w-full h-40 flex-shrink-0 p-4">
        <div className="glass-card h-full w-full flex items-center justify-between p-4 gap-4 rounded-xl">
          <button
            onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
            className="glass-button p-3 rounded-full text-white disabled:opacity-50"
            disabled={activeSlideIndex === 0}
          >
            <ChevronLeft />
          </button>
          <div className="flex-grow h-full overflow-x-auto overflow-y-hidden flex items-center gap-3">
            {Array.from({ length: totalSlides }).map((_, index) => {
              const recipe = slideRecipes[index];
              const active = index === activeSlideIndex;
              return (
                <button
                  key={index}
                  onClick={() => setActiveSlideIndex(index)}
                  className={`h-full aspect-video rounded-lg flex-shrink-0 transition-all duration-200 border border-white/15 overflow-hidden ${
                    active ? 'ring-2 ring-peachSoft' : 'hover:ring-1 hover:ring-white/50'
                  }`}
                >
                  {recipe ? (
                    <div className="w-full h-full relative">
                      <div className="absolute top-0 left-0" style={{ width: '1280px', height: '720px', transform: 'scale(0.18)', transformOrigin: 'top left' }}>
                        <SlideRenderer recipe={recipe} animated={false} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-white/10 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setActiveSlideIndex(Math.min(Math.max(0, totalSlides - 1), activeSlideIndex + 1))}
            className="glass-button p-3 rounded-full text-white disabled:opacity-50"
            disabled={activeSlideIndex >= totalSlides - 1}
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Floating Left Panel (Organizer) */}
      <AnimatePresence>
        {isLeftPanelOpen && (
          <motion.div
            variants={panelVariants}
            initial="closed" animate="open" exit="closed"
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="absolute top-0 left-0 bottom-0 w-80 p-4 z-20"
          >
            <div className="bg-black/20 border border-white/10 rounded-xl h-full flex flex-col backdrop-blur-md">
              <div className="p-3 border-b border-white/10 flex-shrink-0">
                <h3 className="text-sm font-semibold text-white">Slides</h3>
              </div>
              <div className="overflow-y-auto p-2 space-y-2">
                {Array.from({ length: totalSlides }).map((_, index) => {
                  const recipe = slideRecipes[index];
                  if (!recipe) {
                    return (
                      <div key={index} className="w-full p-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/60 w-6 text-center">{index + 1}</span>
                          <div className="w-full aspect-video bg-white/10 rounded-md animate-pulse" />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <button
                      key={recipe.slide_id || index}
                      onClick={() => setActiveSlideIndex(index)}
                      className={`w-full p-1 rounded-lg transition-all duration-200 ${
                        index === activeSlideIndex ? 'bg-white/10 ring-2 ring-peachSoft' : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/60 w-6 text-center">{index + 1}</span>
                        <div className="w-full aspect-video bg-black border border-white/15 rounded-md overflow-hidden relative">
                          <div className="absolute top-0 left-0" style={{ width: '1280px', height: '720px', transform: 'scale(0.18)', transformOrigin: 'top left' }}>
                            <SlideRenderer recipe={recipe} animated={false} />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Right Panel (AI Co-pilot) */}
      <AnimatePresence>
        {isRightPanelOpen && (
          <motion.div
            variants={rightPanelVariants}
            initial="closed" animate="open" exit="closed"
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="absolute top-0 right-0 bottom-0 w-[340px] p-4 z-20"
          >
            <div className="bg-black/20 border border-white/10 rounded-xl h-full backdrop-blur-md">
              <DeckAICopilot activeSlide={activeRecipe} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
