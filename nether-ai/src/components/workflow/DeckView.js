'use client';
import { useMemo, useState, useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { usePresentationStore } from '@/store/usePresentationStore';
import ResponsiveCanvas from '../deck/ResponsiveCanvas';
import SlideRenderer from '../deck/SlideRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { 
    ChevronLeft, ChevronRight, Expand, Download, X as CloseIcon 
} from 'lucide-react';
import DeckAICopilot from '../deck/DeckAICopilot';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import DeckSidebar from './DeckSidebar';

const BottomToolbar = ({
  prevSlide, nextSlide,
  activeSlideIndex, totalSlides,
  onFullscreen
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
      <div className="glass-card flex items-center justify-center gap-2 p-2 rounded-full shadow-lg">
        <div className="flex items-center gap-3 px-2">
           <button onClick={prevSlide} className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors disabled:opacity-40" aria-label="Previous Slide" disabled={activeSlideIndex === 0}>
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-mono w-16 text-center text-white/90">{activeSlideIndex + 1} / {totalSlides}</span>
           <button onClick={nextSlide} className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors disabled:opacity-40" aria-label="Next Slide" disabled={activeSlideIndex >= totalSlides - 1}>
              <ChevronRight size={20} />
            </button>
        </div>

        <button onClick={onFullscreen} className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors" aria-label="Fullscreen">
          <Expand size={18} />
        </button>
        
        <button className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors" aria-label="Export Presentation">
            <Download size={18} />
        </button>
      </div>
    </div>
  );
};


export default function DeckView() {
  const { isLoading, isFullscreen, setFullscreen } = useUIStore();
  const { presentation, setActiveSlideIndex, updateSlideRecipe } = usePresentationStore();
  const { slideRecipes = [], activeSlideIndex = 0 } = presentation || {};
  const totalSlides = presentation?.blueprint?.slides?.length || slideRecipes.length || 0;

  const [direction, setDirection] = useState(0);
  
  const activeRecipe = useMemo(() => (
    Array.isArray(slideRecipes) && activeSlideIndex < slideRecipes.length ? slideRecipes[activeSlideIndex] : null
  ), [slideRecipes, activeSlideIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, setFullscreen]);

  const handleUpdateSlide = (newRecipe) => {
    updateSlideRecipe(activeSlideIndex, newRecipe);
  };

  const paginate = (newDirection) => {
    if (newDirection > 0) { // next
      setActiveSlideIndex(Math.min(activeSlideIndex + 1, totalSlides - 1));
    } else { // prev
      setActiveSlideIndex(Math.max(activeSlideIndex - 1, 0));
    }
    setDirection(newDirection);
  };
  
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98
    })
  };

  if (isFullscreen) {
    return (
        <div className="fixed inset-0 bg-black z-50">
            <button 
                onClick={() => setFullscreen(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full text-white/80 bg-black/50 hover:bg-white/20 transition-colors"
            >
                <CloseIcon size={24} />
            </button>
            <ResponsiveCanvas>
                {activeRecipe ? (
                    <SlideRenderer recipe={activeRecipe} animated={true} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/60">
                    Loading Slide...
                    </div>
                )}
            </ResponsiveCanvas>
        </div>
    );
  }

  return (
    <div className="h-full w-full p-4">
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={20} minSize={15} maxSize={30} className="pr-2 !overflow-visible">
           <DeckSidebar
              slideRecipes={slideRecipes}
              totalSlides={totalSlides}
              activeSlideIndex={activeSlideIndex}
              onSlideSelect={setActiveSlideIndex}
           />
        </Panel>
        <PanelResizeHandle className="w-2.5 flex items-center justify-center bg-transparent group">
           <div className="w-1 h-16 bg-white/10 group-hover:bg-white/20 rounded-full transition-colors" />
        </PanelResizeHandle>

        <Panel defaultSize={60} minSize={30}>
            <div className="w-full h-full glass-card rounded-2xl overflow-hidden relative">
                <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={activeSlideIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                    x: { type: "spring", stiffness: 300, damping: 35 },
                    opacity: { duration: 0.3 }
                    }}
                    className="w-full h-full absolute"
                >
                    <ResponsiveCanvas>
                    {activeRecipe ? (
                        <SlideRenderer recipe={activeRecipe} animated={true} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/60">
                        {isLoading ? <LoadingSpinner /> : 'Select a slide.'}
                        </div>
                    )}
                    </ResponsiveCanvas>
                </motion.div>
                </AnimatePresence>
                
                <BottomToolbar 
                    prevSlide={() => paginate(-1)}
                    nextSlide={() => paginate(1)}
                    activeSlideIndex={activeSlideIndex}
                    totalSlides={totalSlides}
                    onFullscreen={() => setFullscreen(true)}
                />
            </div>
        </Panel>
        <PanelResizeHandle className="w-2.5 flex items-center justify-center bg-transparent group">
           <div className="w-1 h-16 bg-white/10 group-hover:bg-white/20 rounded-full transition-colors" />
        </PanelResizeHandle>

        <Panel defaultSize={20} minSize={15} maxSize={30} className="pl-2 !overflow-visible">
          <div className="h-full w-full glass-card rounded-2xl overflow-hidden">
            <DeckAICopilot activeSlide={activeRecipe} onUpdateSlide={handleUpdateSlide} />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}