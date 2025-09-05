'use client';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { usePresentationStore } from '@/store/usePresentationStore';
import ResponsiveCanvas from '../deck/ResponsiveCanvas';
import SlideRenderer from '../deck/SlideRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { PanelLeft, PanelRight, ChevronLeft, ChevronRight } from 'lucide-react';
import DeckAICopilot from '../deck/DeckAICopilot';
import { LoadingSpinner } from '../shared/LoadingSpinner';

const DeckToolbar = ({
  toggleLeftPanel, toggleRightPanel,
  prevSlide, nextSlide,
  activeSlideIndex, totalSlides
}) => {
  return (
    <div className="relative z-10 w-full flex items-center justify-center">
      <div className="glass-card flex items-center justify-center gap-2 p-2 rounded-full shadow-lg">
        <button onClick={toggleLeftPanel} className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors" aria-label="Toggle Tools Panel">
          <PanelLeft size={18} />
        </button>
        
        <div className="flex items-center gap-3 px-2">
           <button onClick={prevSlide} className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors disabled:opacity-40" aria-label="Previous Slide" disabled={activeSlideIndex === 0}>
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-mono w-16 text-center text-white/90">{activeSlideIndex + 1} / {totalSlides}</span>
           <button onClick={nextSlide} className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors disabled:opacity-40" aria-label="Next Slide" disabled={activeSlideIndex >= totalSlides - 1}>
              <ChevronRight size={20} />
            </button>
        </div>

        <button onClick={toggleRightPanel} className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors" aria-label="Toggle AI Co-pilot Panel">
          <PanelRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default function DeckView() {
  const { isLoading } = useUIStore();
  const { presentation, setActiveSlideIndex } = usePresentationStore();
  const { slideRecipes = [], activeSlideIndex = 0 } = presentation || {};
  const totalSlides = presentation?.blueprint?.slides?.length || slideRecipes.length || 0;

  // State for panel visibility and slide transition direction
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [direction, setDirection] = useState(0);
  
  // Refs for imperative panel control
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const filmstripRef = useRef(null);

  // Active slide recipe memoization
  const activeRecipe = useMemo(() => (
    Array.isArray(slideRecipes) && activeSlideIndex < slideRecipes.length ? slideRecipes[activeSlideIndex] : null
  ), [slideRecipes, activeSlideIndex]);

  // Handle responsive panel state on mount
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      // Auto-collapse Tools panel (placeholder) to maximize canvas space
      setIsLeftPanelOpen(false);
      leftPanelRef.current?.collapse?.();
      // Keep AI panel open on desktop for guidance
      setIsRightPanelOpen(isDesktop);
      leftPanelRef.current?.resize?.(isDesktop ? 16 : 0);
      rightPanelRef.current?.resize?.(isDesktop ? 22 : 0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Panel toggle functions
  const togglePanel = (panelRef, isOpen, setIsOpen, defaultSize) => {
    const panel = panelRef.current;
    if (!panel) return;
    if (isOpen) {
      panel.collapse();
    } else {
      panel.expand();
      // Only resize if it's collapsed to 0, otherwise let it return to previous size
      if (panel.getSize() < 5) {
        panel.resize(defaultSize);
      }
    }
    setIsOpen(!isOpen);
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

  useEffect(() => {
    const filmstrip = filmstripRef.current;
    if (filmstrip && filmstrip.children[activeSlideIndex]) {
      const activeChild = filmstrip.children[activeSlideIndex];
      activeChild.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeSlideIndex]);

  return (
    <div className="h-full w-full p-4">
      <PanelGroup direction="horizontal" className="h-full">
        {/* Left Tools Panel */}
        <Panel ref={leftPanelRef} collapsible onCollapse={() => setIsLeftPanelOpen(false)} onExpand={() => setIsLeftPanelOpen(true)} defaultSize={16} minSize={12} maxSize={28} className="pr-2 !overflow-visible">
           <div className="h-full w-full glass-card flex flex-col rounded-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-white">Tools</h3>
                <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/10 text-white/70">Coming soon</span>
              </div>
              <div className="flex-1 p-4 text-sm text-white/60">
                The Tools panel is under development. To focus on your slides, it stays hidden by default. Use the left icon in the toolbar to toggle it anytime.
              </div>
           </div>
        </Panel>
        <PanelResizeHandle className="w-2.5 flex items-center justify-center bg-transparent group">
           <div className="w-1 h-16 bg-white/10 group-hover:bg-white/20 rounded-full transition-colors" />
        </PanelResizeHandle>

        {/* Center Content Area */}
        <Panel defaultSize={62} minSize={30}>
          <div className="w-full h-full flex flex-col gap-4">
            {/* Top Toolbar (no overlay) */}
            <DeckToolbar 
              toggleLeftPanel={() => togglePanel(leftPanelRef, isLeftPanelOpen, setIsLeftPanelOpen, 16)}
              toggleRightPanel={() => togglePanel(rightPanelRef, isRightPanelOpen, setIsRightPanelOpen, 22)}
              prevSlide={() => paginate(-1)}
              nextSlide={() => paginate(1)}
              activeSlideIndex={activeSlideIndex}
              totalSlides={totalSlides}
            />
            {/* Main Slide Viewer */}
            <div className="flex-1 w-full h-full glass-card rounded-2xl overflow-hidden relative">
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
                        {isLoading ? `Generating Slide ${activeSlideIndex + 1}...` : 'Select a slide.'}
                      </div>
                    )}
                  </ResponsiveCanvas>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Horizontal Filmstrip */}
            <div className="h-40 w-full glass-card rounded-2xl p-3">
              <div 
                ref={filmstripRef}
                className="h-full w-full overflow-x-auto overflow-y-hidden flex items-center gap-3 snap-x snap-mandatory"
              >
                 {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlideIndex(index)}
                    className={`h-full aspect-video rounded-lg flex-shrink-0 transition-all duration-300 border-2 overflow-hidden relative group snap-center ${
                      activeSlideIndex === index ? 'border-peachSoft shadow-lg shadow-peachSoft/20' : 'border-white/15 hover:border-white/40'
                    }`}
                  >
                    {/* Index label */}
                    <div className="absolute top-1.5 left-1.5 z-10 text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white/80">
                      {index + 1}
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
                        <motion.div 
                          className="h-full bg-peachSoft" 
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: activeSlideIndex === index ? 1 : 0 }}
                          transition={{ duration: 0.4, ease: 'easeInOut' }}
                          style={{ transformOrigin: 'left' }}
                        />
                    </div>
                    <div className="w-full h-full relative bg-black">
                      <div className="absolute top-0 left-0" style={{ width: '1280px', height: '720px', transform: 'scale(0.18)', transformOrigin: 'top left' }}>
                        <SlideRenderer recipe={slideRecipes[index]} animated={false} />
                      </div>
                      {/* Loading overlay for slides still generating */}
                      {!slideRecipes[index] && (
                        <div className="absolute inset-0 grid place-items-center bg-black/40">
                          <LoadingSpinner />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Panel>
        <PanelResizeHandle className="w-2.5 flex items-center justify-center bg-transparent group">
           <div className="w-1 h-16 bg-white/10 group-hover:bg-white/20 rounded-full transition-colors" />
        </PanelResizeHandle>

        {/* Right AI Co-pilot Panel */}
        <Panel ref={rightPanelRef} collapsible onCollapse={() => setIsRightPanelOpen(false)} onExpand={() => setIsRightPanelOpen(true)} defaultSize={22} minSize={18} maxSize={35} className="pl-2 !overflow-visible">
          <div className="h-full w-full glass-card rounded-2xl overflow-hidden">
            <DeckAICopilot activeSlide={activeRecipe} />
          </div>
        </Panel>

      </PanelGroup>
    </div>
  );
}
