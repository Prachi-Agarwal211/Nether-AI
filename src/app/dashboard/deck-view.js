// src/app/dashboard/deck-view.js
'use client';

import { useAppStore } from '@/utils/zustand-store';
import { SlideRenderer } from '@/components/slide-renderer';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeProvider from '@/components/ThemeProvider';

// Single-panel code view that shows actual generated HTML/CSS/JS when available; falls back to pseudo-code
const CodePanel = ({ slide, blueprint }) => {
  const [tab, setTab] = useState('html'); // 'html' | 'css' | 'js' | 'pseudo'
  const hasCode = slide?.code && (slide.code.html || slide.code.css || slide.code.js);

  useEffect(() => {
    if (!hasCode) setTab('pseudo');
    else if (!slide.code[tab]) setTab(slide.code.html ? 'html' : (slide.code.css ? 'css' : 'js'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide?.slide_id]);

  // Build pseudo-code as fallback
  const pseudo = (() => {
    if (!blueprint || !Array.isArray(blueprint.slides) || !slide) return '';
    const sb = blueprint.slides.find((s) => s.slide_id === slide.slide_id);
    if (!sb) return '';
    const escDq = (s) => (s || '').replace(/"/g, '\\"');
    return [
      `// Slide ${sb.slide_index}: ${sb.slide_title}`,
      'createSlide({',
      `  id: '${sb.slide_id}',`,
      '  title: {',
      `    content: "${escDq(sb.slide_title)}",`,
      `    accent: ${sb.slide_index === 1},`,
      '  },',
      '  content: [',
      ...(Array.isArray(sb.content_points) ? sb.content_points.map((p) => `    "${escDq(p)}",`) : []),
      '  ],',
      '  visual: {',
      `    prompt: "${escDq(sb.visual_suggestion?.description || 'None')}"`,
      '  }',
      '});',
    ].join('\n');
  })();

  const content = hasCode
    ? (tab === 'html' ? slide.code.html : tab === 'css' ? slide.code.css : slide.code.js)
    : pseudo;

  return (
    <div className="w-full h-full bg-black/50 p-4 rounded-lg font-mono text-sm text-green-400 border border-green-400/20 overflow-hidden">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-green-400/20">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex items-center gap-1">
          {hasCode ? (
            <>
              <button className={`px-2 py-0.5 rounded ${tab==='html'?'bg-white text-black':'text-white/70 hover:bg-white/10'}`} onClick={() => setTab('html')}>HTML</button>
              <button className={`px-2 py-0.5 rounded ${tab==='css'?'bg-white text-black':'text-white/70 hover:bg-white/10'}`} onClick={() => setTab('css')}>CSS</button>
              <button className={`px-2 py-0.5 rounded ${tab==='js'?'bg-white text-black':'text-white/70 hover:bg-white/10'}`} onClick={() => setTab('js')}>JS</button>
            </>
          ) : (
            <span className="text-white/60 text-xs">Pseudo-code</span>
          )}
        </div>
      </div>
      <pre className="h-full overflow-y-auto whitespace-pre-wrap">
        <code>{content}</code>
      </pre>
    </div>
  );
};


export default function DeckView() {
  const { presentation, isLoading, error, exportToPPTX, setActiveSlideIndex } = useAppStore((s) => ({
    presentation: s.presentation,
    isLoading: s.isLoading,
    error: s.error,
    exportToPPTX: s.exportToPPTX,
    setActiveSlideIndex: s.setActiveSlideIndex,
  }));
  const recipes = presentation.slideRecipes;
  const activeIndex = presentation.activeSlideIndex;
  const themeRuntime = presentation.themeRuntime;
  const blueprint = presentation.blueprint;
  
  const [exportError, setExportError] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  // Simplified: only 'preview' and 'code'
  const [subView, setSubView] = useState('preview'); // 'preview' | 'code'
  const [slideError, setSlideError] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (!recipes || !recipes.length) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setActiveSlideIndex(Math.min(activeIndex + 1, recipes.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setActiveSlideIndex(Math.max(activeIndex - 1, 0));
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setSubView((v) => v === 'code' ? 'preview' : 'code');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, recipes, setActiveSlideIndex]);

  useEffect(() => {
    const onMsg = (e) => {
      const d = e?.data;
      if (d && d.type === 'slide_error') {
        setSlideError(d.message || 'Slide error');
        window.clearTimeout(onMsg.__t);
        onMsg.__t = window.setTimeout(() => setSlideError(null), 6000);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
  };
  
  const handleExport = async () => {
    try {
      setExportError(null);
      await exportToPPTX();
    } catch (error) {
      setExportError(error.message);
      setTimeout(() => setExportError(null), 5000);
    }
  };

  // Stage-and-Scale wrapper: centers a 1280x720 slide and scales to fit available space
  const Stage = ({ children }) => {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const BASE_W = 1280;
    const BASE_H = 720;

    useEffect(() => {
      if (!containerRef.current) return;
      const el = containerRef.current;
      const ro = new ResizeObserver(([entry]) => {
        const cr = entry.contentRect;
        const s = Math.max(0.1, Math.min(cr.width / BASE_W, cr.height / BASE_H));
        setScale(s);
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
        <div style={{ width: BASE_W, height: BASE_H, transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          {children}
        </div>
      </div>
    );
  };

  const renderDeckContent = () => {
    if (isLoading) {
      return (
        <div className="aspect-video bg-black/30 border border-white/10 rounded-lg">
          {/* Loading animation can be placed here */}
        </div>
      );
    }
    if (!recipes || recipes.length === 0) {
      return (
        <div className="aspect-video bg-black/30 rounded-lg flex items-center justify-center text-white/70">
          <div>
            <h3 className="text-xl font-semibold mb-2">Presentation Ready</h3>
            <p>Use the thumbnails on the left to navigate your slides.</p>
          </div>
        </div>
      );
    }
    
    const current = recipes[activeIndex];

    if (subView === 'code') {
      return (
        <div className="aspect-video bg-black/30 border border-white/10 rounded-lg p-3">
          <CodePanel slide={current} blueprint={blueprint} />
        </div>
      );
    }

    // Default to the main preview canvas.
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={current?.slide_id || activeIndex}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="aspect-video"
        >
          <ThemeProvider className="w-full h-full block overflow-hidden">
            <Stage>
              <SlideRenderer recipe={{ ...current, theme_runtime: themeRuntime }} showGrid={showGrid} />
            </Stage>
          </ThemeProvider>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-5">
      <div className="lg:col-span-1 p-4 space-y-2 overflow-y-auto bg-black/30 border-r border-white/10">
        {!isLoading && recipes && recipes.length > 0 && recipes.map((r, i) => (
          <button key={r.slide_id} onClick={() => setActiveSlideIndex(i)} className={`w-full text-left p-2 rounded border ${i === activeIndex ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'}`}>
            <div className="text-xs text-white/70">Slide {i + 1}</div>
            <div className="text-sm text-white truncate">{(r.elements || [])[0]?.content || 'Slide'}</div>
          </button>
        ))}
        {isLoading && (
          <div className="p-2 text-center text-white/70 text-sm">{typeof isLoading === 'string' ? isLoading : 'Generating slides...'}</div>
        )}
      </div>
      <div className="lg:col-span-4 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white/80">{isLoading ? (typeof isLoading === 'string' ? isLoading : 'AI is generating your presentation...') : `Slide ${activeIndex + 1} of ${recipes.length}`}</div>
          <div className="flex gap-2 items-center">
            <button
              className={`px-3 py-1 text-sm rounded-full ${subView === 'preview' ? 'bg-white text-black' : 'text-white/70 hover:bg-white/10'}`}
              onClick={() => setSubView('preview')}
              disabled={isLoading || !recipes || recipes.length === 0}
            >
              Preview
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full ${subView === 'code' ? 'bg-white text-black' : 'text-white/70 hover:bg-white/10'}`}
              onClick={() => setSubView('code')}
              disabled={isLoading || !recipes || recipes.length === 0}
            >
              Code
            </button>
            <button 
              className="secondary-button"
              onClick={() => setShowGrid(v => !v)}
              disabled={isLoading}
            >
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </button>
            <button 
              className="secondary-button" 
              onClick={handleExport}
              disabled={isLoading}
            >
              {isLoading ? 'Exporting...' : 'Export PPTX'}
            </button>
            <button className="primary-button" onClick={enterFullscreen} disabled={isLoading}>Present</button>
          </div>
        </div>

        {exportError && (
          <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-sm">
            Export failed: {exportError}
          </div>
        )}
        {slideError && (
          <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 text-sm">
            Slide error: {slideError}
          </div>
        )}

        <div className="flex-1 w-full flex items-center justify-center">
          <div className="w-full max-w-6xl">
            {renderDeckContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
 
