'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePresentationStore } from '@/store/usePresentationStore';
import * as supabaseService from '@/services/supabaseService';
import SlideRenderer from '@/components/deck/SlideRenderer';
import ResponsiveCanvas from '@/components/deck/ResponsiveCanvas';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import VantaBackground from '@/components/shared/VantaBackground';

export default function PresenterPage({ params }) {
  const { presentation, setPresentation, activeSlideIndex, setActiveSlideIndex } = usePresentationStore();
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (presentation.id !== params.id) {
        setLoading(true);
        try {
          const data = await supabaseService.loadPresentation(params.id);
          setPresentation(data);
        } catch (error) {
          console.error("Failed to load presentation:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadData();
  }, [params.id, presentation.id, setPresentation]);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'ArrowRight' || e.key === ' ') setActiveSlideIndex(Math.min(activeSlideIndex + 1, presentation.slideRecipes.length - 1));
      if (e.key === 'ArrowLeft') setActiveSlideIndex(Math.max(activeSlideIndex - 1, 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentation.slideRecipes, activeSlideIndex]);

  const activeRecipe = useMemo(() => presentation.slideRecipes[activeSlideIndex], [presentation.slideRecipes, activeSlideIndex]);

  if (loading) return <div className="w-screen h-screen bg-black flex items-center justify-center text-white">Loading Presentation...</div>;

  const total = presentation.slideRecipes.length || 1;
  const progress = ((activeSlideIndex + 1) / total) * 100;

  const goPrev = () => setActiveSlideIndex(activeSlideIndex - 1);
  const goNext = () => setActiveSlideIndex(activeSlideIndex + 1);

  return (
    <div className="w-screen h-screen text-white flex flex-col relative">
      <VantaBackground />
      <main className="flex-1 flex flex-col relative z-10">
        {/* Header / Toolbar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-white/60 animate-pulse" />
            <h1 className="text-sm md:text-base font-medium text-white/90 font-sans">
              {presentation.topic || 'Untitled Presentation'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goPrev} aria-label="Previous slide" className="primary-button h-9 px-3 text-sm">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} aria-label={isPlaying ? 'Pause' : 'Play'} className="pearl-button h-9 px-3 text-sm">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={goNext} aria-label="Next slide" className="primary-button h-9 px-3 text-sm">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="ml-3 text-sm text-white/70">{activeSlideIndex + 1} / {total}</div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 grid md:grid-cols-[260px_1fr_320px] grid-cols-1 gap-4 p-3 md:p-4">
          {/* Thumbnails Sidebar (Outline) */}
          <aside className="hidden md:flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-3 py-2 text-xs text-white/70 border-b border-white/10">Slides</div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {presentation.slideRecipes.map((r, i) => {
                const title = r?.props?.title || r?.layout_type || `Slide ${i + 1}`;
                const active = i === activeSlideIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveSlideIndex(i)}
                    className={`w-full text-left p-3 rounded-lg border transition ${active ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`min-w-6 h-6 px-2 rounded text-xs flex items-center justify-center ${active ? 'bg-white/20' : 'bg-white/10'}`}>{i + 1}</div>
                      <div className="truncate text-sm">{title}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Slide Canvas */}
          <section className="relative bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlideIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-full h-full"
              >
                <ResponsiveCanvas>
                  {activeRecipe && <SlideRenderer recipe={activeRecipe} animated={true} />}
                </ResponsiveCanvas>
              </motion.div>
            </AnimatePresence>
          </section>

          {/* Speaker Notes Panel */}
          <aside className="hidden md:flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-semibold">Speaker Notes</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-white/80 whitespace-pre-wrap">
              {activeRecipe?.speaker_notes || 'No notes for this slide.'}
            </div>
            <div className="px-4 py-3 border-t border-white/10 text-sm text-white/70">
              Slide {activeSlideIndex + 1} of {total}
            </div>
          </aside>

          {/* Mobile Outline */}
          <div className="md:hidden -mt-2">
            <div className="px-2 text-xs text-white/70 mb-2">Slides</div>
            <div className="flex overflow-x-auto gap-2 pb-2">
              {presentation.slideRecipes.map((r, i) => {
                const active = i === activeSlideIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveSlideIndex(i)}
                    className={`min-w-[140px] p-3 rounded-lg border ${active ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10'}`}
                  >
                    <div className="text-xs text-white/70 mb-1">{i + 1}</div>
                    <div className="truncate text-sm">{r?.props?.title || r?.layout_type || `Slide ${i + 1}`}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Notes */}
          <div className="md:hidden bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold">Speaker Notes</div>
            <div className="p-4 text-white/80 whitespace-pre-wrap">
              {activeRecipe?.speaker_notes || 'No notes for this slide.'}
            </div>
          </div>
        </div>

        {/* Footer Progress */}
        <footer className="px-4 md:px-6 py-3 bg-white/5 border-t border-white/10">
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white/60" style={{ width: `${progress}%` }} />
          </div>
        </footer>
      </main>
    </div>
  );
}
