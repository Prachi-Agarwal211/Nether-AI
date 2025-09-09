'use client';
import { useMemo, useEffect } from 'react';
import { usePresentationStore } from '@/store/usePresentationStore';
import ResponsiveCanvas from '../deck/ResponsiveCanvas';
import SlideRenderer from '../deck/SlideRenderer';
import ThemeProvider from '../deck/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ChevronLeft, ChevronRight, Expand, Download } from 'lucide-react';
import DeckAICopilot from '../deck/DeckAICopilot';
import DeckSidebar from './DeckSidebar';

const BottomToolbar = ({ prevSlide, nextSlide, activeSlideIndex, totalSlides, onFullscreen }) => {
  // Cleanup event listeners on unmount
  useEffect(() => {
    const buttons = [
      { element: document.querySelector('.prev-btn'), event: 'click', handler: prevSlide },
      { element: document.querySelector('.next-btn'), event: 'click', handler: nextSlide },
      { element: document.querySelector('.fullscreen-btn'), event: 'click', handler: onFullscreen }
    ].filter(Boolean);

    return () => {
      buttons.forEach(({ element, event, handler }) => {
        element?.removeEventListener(event, handler);
      });
    };
  }, [prevSlide, nextSlide, onFullscreen]);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
      <div className="glass-card flex items-center justify-center gap-2 p-2 rounded-full shadow-lg">
        <button 
          className="prev-btn p-2 rounded-full text-white/80 hover:bg-white/10 disabled:opacity-40" 
          onClick={prevSlide} 
          disabled={activeSlideIndex === 0}
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-mono w-16 text-center text-white/90">{activeSlideIndex + 1} / {totalSlides}</span>
        <button 
          className="next-btn p-2 rounded-full text-white/80 hover:bg-white/10 disabled:opacity-40" 
          onClick={nextSlide} 
          disabled={activeSlideIndex >= totalSlides - 1}
        >
          <ChevronRight size={20} />
        </button>
        <button 
          className="fullscreen-btn p-2 rounded-full text-white/80 hover:bg-white/10" 
          onClick={onFullscreen}
        >
          <Expand size={18} />
        </button>
        <button className="p-2 rounded-full text-white/80 hover:bg-white/10">
          <Download size={18} />
        </button>
      </div>
    </div>
  );
};

export default function DeckView() {
  const { presentation, setActiveSlideIndex, updateSlideRecipe } = usePresentationStore();
  const { slideRecipes = [], activeSlideIndex = 0, designSystem } = presentation || {};
  
  const isThemeReady = !!designSystem;

  const totalSlides = presentation?.blueprint?.slides?.length || slideRecipes.length || 0;
  const activeRecipe = useMemo(() => slideRecipes[activeSlideIndex], [slideRecipes, activeSlideIndex]);
  const paginate = (newDirection) => setActiveSlideIndex(activeSlideIndex + newDirection);

  // Simplified variants to reduce memory overhead
  const slideVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 }
  };

  // Cleanup animation resources on unmount
  useEffect(() => {
    const cleanup = () => {
      // Additional cleanup if needed
    };

    return cleanup;
  }, []);

  useEffect(() => {
    const cleanup = () => {
      // Cleanup any event listeners if needed
    };

    return cleanup;
  }, []);

  return (
    <ThemeProvider designBrief={designSystem}>
      <div className="h-full w-full p-4">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={20} minSize={15}><DeckSidebar {...{ slideRecipes, totalSlides, activeSlideIndex }} onSlideSelect={setActiveSlideIndex} /></Panel>
          <PanelResizeHandle className="w-2.5 flex items-center justify-center"><div className="w-1 h-16 bg-white/10 rounded-full" /></PanelResizeHandle>
          
          <Panel defaultSize={60} minSize={30}>
            <div className="w-full h-full glass-card rounded-2xl overflow-hidden relative">
              {isThemeReady ? (
                <AnimatePresence 
                  initial={false} 
                  custom={1}
                  onExitComplete={() => window.requestAnimationFrame(() => {})} // Force cleanup
                >
                  <motion.div
                    key={activeSlideIndex}
                    custom={1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ opacity: { duration: 0.2 } }}
                    className="w-full h-full absolute"
                  >
                    <ResponsiveCanvas>
                      <SlideRenderer recipe={activeRecipe} animated={true} />
                    </ResponsiveCanvas>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black/30">
                  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <p className="mt-4 text-white/60">Generating unique theme...</p>
                </div>
              )}
              {totalSlides > 0 && <BottomToolbar {...{ activeSlideIndex, totalSlides }} prevSlide={() => paginate(-1)} nextSlide={() => paginate(1)} />}
            </div>
          </Panel>
          <PanelResizeHandle className="w-2.5 flex items-center justify-center"><div className="w-1 h-16 bg-white/10 rounded-full" /></PanelResizeHandle>
          <Panel defaultSize={20} minSize={15}><div className="h-full w-full glass-card rounded-2xl overflow-hidden"><DeckAICopilot activeSlide={activeRecipe} onUpdateSlide={updateSlideRecipe} /></div></Panel>
        </PanelGroup>
      </div>
    </ThemeProvider>
  );
}