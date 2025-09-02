'use client';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { usePresentationStore } from '@/store/usePresentationStore';
import ResponsiveCanvas from '../deck/ResponsiveCanvas';
import SlideRenderer from '../deck/SlideRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft, PanelRight, ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import DeckAICopilot from '../deck/DeckAICopilot';
import DesignSystemEditor from '../ui/DesignSystemEditor';

export default function DeckView() {
  const { isLoading } = useUIStore();
  const { presentation, setActiveSlideIndex } = usePresentationStore();
  const { slideRecipes = [], activeSlideIndex = 0 } = presentation || {};
  const totalSlides = presentation?.blueprint?.slides?.length || slideRecipes.length || 0;
  const activeRecipe = useMemo(() => (
    Array.isArray(slideRecipes) && activeSlideIndex < slideRecipes.length ? slideRecipes[activeSlideIndex] : null
  ), [slideRecipes, activeSlideIndex]);

  // Panel visibility state
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true); // Default open, will be adjusted on mount
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Handle responsive panel state on mount
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      setIsLeftPanelOpen(isDesktop);
      setIsRightPanelOpen(isDesktop);
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Design system editor
  const [isDesignEditorOpen, setIsDesignEditorOpen] = useState(false);

  // Touch handling for swipe navigation
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left - next slide
        setActiveSlideIndex(Math.min(Math.max(0, totalSlides - 1), activeSlideIndex + 1));
      } else {
        // Swipe right - previous slide
        setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
      }
    }
  };

  const panelVariants = { open: { x: 0, opacity: 1 }, closed: { x: '-100%', opacity: 0 } };
  const rightPanelVariants = { open: { x: 0, opacity: 1 }, closed: { x: '100%', opacity: 0 } };

  return (
    // Designer's Cockpit: layered layout
    <div
      className="h-full w-full flex flex-col relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

      {/* Top toolbar toggles */}
      <div className="absolute top-2 left-2 right-2 z-30 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLeftPanelOpen(v => !v)}
            className="glass-button p-3 sm:p-3 md:p-4 rounded-full text-white touch-manipulation"
            aria-label="Toggle left panel"
          >
            <PanelLeft size={18} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => setIsDesignEditorOpen(true)}
            className="glass-button p-3 sm:p-3 md:p-4 rounded-full text-white touch-manipulation"
            aria-label="Customize design system"
          >
            <Palette size={18} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </button>
        </div>
        <button
          onClick={() => setIsRightPanelOpen(v => !v)}
          className="glass-button p-3 sm:p-3 md:p-4 rounded-full text-white touch-manipulation"
          aria-label="Toggle right panel"
        >
          <PanelRight size={18} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
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
      <div className="w-full h-32 sm:h-40 flex-shrink-0 p-2 sm:p-4">
        <div className="glass-card h-full w-full flex items-center justify-between p-2 sm:p-4 gap-2 sm:gap-4 rounded-xl">
          <button
            onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
            className="glass-button p-3 sm:p-3 md:p-4 rounded-full text-white disabled:opacity-50 touch-manipulation"
            disabled={activeSlideIndex === 0}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="flex-grow h-full overflow-x-auto overflow-y-hidden flex items-center gap-2 sm:gap-3">
            {Array.from({ length: totalSlides }).map((_, index) => {
              const recipe = slideRecipes[index];
              const active = index === activeSlideIndex;
              return (
                <button
                  key={index}
                  onClick={() => setActiveSlideIndex(index)}
                  className={`h-full aspect-video rounded-lg flex-shrink-0 transition-all duration-200 border border-white/15 overflow-hidden touch-manipulation ${
                    active ? 'ring-2 ring-peachSoft' : 'hover:ring-1 hover:ring-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
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
            className="glass-button p-3 sm:p-3 md:p-4 rounded-full text-white disabled:opacity-50 touch-manipulation"
            disabled={activeSlideIndex >= totalSlides - 1}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
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
            className="absolute top-0 left-0 bottom-0 w-80 sm:w-80 md:w-96 p-4 z-20"
          >
            <div className="bg-black/20 border border-white/10 rounded-xl h-full flex flex-col backdrop-blur-md shadow-2xl shadow-black/50 ring-1 ring-white/5">
              <div className="p-3 border-b border-white/10 flex-shrink-0 bg-gradient-to-r from-white/5 to-transparent">
                <h3 className="text-sm font-semibold text-white drop-shadow-sm">Slides</h3>
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
                      className={`w-full p-1 rounded-lg transition-all duration-200 touch-manipulation ${
                        index === activeSlideIndex ? 'bg-white/10 ring-2 ring-peachSoft' : 'hover:bg-white/10'
                      }`}
                      aria-label={`Select slide ${index + 1}`}
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
            className="absolute top-0 right-0 bottom-0 w-[340px] sm:w-[340px] md:w-[400px] p-4 z-20"
          >
            <div className="bg-black/20 border border-white/10 rounded-xl h-full backdrop-blur-md shadow-2xl shadow-black/50 ring-1 ring-white/5">
              <DeckAICopilot activeSlide={activeRecipe} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Design System Editor */}
      <DesignSystemEditor
        isOpen={isDesignEditorOpen}
        onClose={() => setIsDesignEditorOpen(false)}
      />

    </div>
  );
}
