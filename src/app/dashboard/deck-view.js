'use client';

// DeckView per MASTER_PLAN Section 4.3
import { useAppStore } from '@/utils/zustand-store';
import { SlideRenderer } from '@/components/slide-renderer';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeProvider from '@/components/ThemeProvider';

// Advanced animation that synthesizes pseudo-code from the actual blueprint
const AiIsGeneratingAnimation = ({ blueprint }) => {
  const [visibleLines, setVisibleLines] = useState([]);

  useEffect(() => {
    if (!blueprint || !Array.isArray(blueprint.slides)) return;

    const esc = (s) => (s || '').replace(/'/g, "\\'");
    const lines = [];
    lines.push(`// Initializing presentation: "${esc(blueprint.topic || 'Untitled')}"`);
    lines.push(`import { Presentation, Slide, Layout } from 'nether-ai-engine';`);
    lines.push('');
    lines.push('const presentation = new Presentation({');
    lines.push(`  theme: '${esc(blueprint.theme?.name || 'DynamicTheme')}',`);
    lines.push('});');
    lines.push('');

    blueprint.slides.forEach((slide, idx) => {
      const n = idx + 1;
      const title = esc(slide.slide_title || `Slide ${n}`);
      lines.push(`// Generating Slide ${n}: ${title}`);
      lines.push(`const slide${n} = new Slide(Layout.TitleAndContent);`);
      lines.push(`slide${n}.addTitle('${title}');`);
      if (Array.isArray(slide.content_points) && slide.content_points.length) {
        const pts = slide.content_points.map((p) => `'${esc(p)}'`).join(', ');
        lines.push(`slide${n}.addBullets([${pts}]);`);
      }
      if (slide.visual_suggestion?.description) {
        lines.push(`slide${n}.addVisual({ type: 'image', prompt: '${esc(slide.visual_suggestion.description)}' });`);
      }
      lines.push(`presentation.add(slide${n});`);
      lines.push('');
    });

    lines.push('// Finalizing...');
    lines.push('presentation.render();');

    // typing animation
    let lineIndex = 0;
    let charIndex = 0;
    setVisibleLines([]);
    const interval = setInterval(() => {
      if (lineIndex < lines.length) {
        const line = lines[lineIndex];
        setVisibleLines((prev) => {
          const next = [...prev];
          if (!next[lineIndex]) next[lineIndex] = '';
          next[lineIndex] += line[charIndex] || '';
          return next;
        });
        charIndex++;
        if (charIndex >= line.length) {
          lineIndex++;
          charIndex = 0;
        }
      } else {
        clearInterval(interval);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [blueprint]);

  return (
    <div className="w-full h-full bg-black/50 p-6 rounded-lg font-mono text-sm text-green-400 overflow-hidden border border-green-400/20">
      <div className="flex items-center pb-2 mb-2 border-b border-green-400/20">
        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="ml-auto text-green-400/50">/src/core/ai-presenter.js</span>
      </div>
      <pre className="h-full overflow-y-auto">
        {visibleLines.map((line, index) => (
          <div key={index}>
            <span className="text-green-400/30 mr-2 select-none">{index + 1}</span>
            {line}
            {index === visibleLines.length - 1 && <span className="animate-pulse">|</span>}
          </div>
        ))}
      </pre>
    </div>
  );
};

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
  const recipes = useAppStore((s) => s.presentation.slideRecipes);
  const activeIndex = useAppStore((s) => s.presentation.activeSlideIndex);
  const themeRuntime = useAppStore((s) => s.presentation.themeRuntime);
  const blueprint = useAppStore((s) => s.presentation.blueprint);
  const isLoading = useAppStore((s) => s.isLoading);
  const setActiveSlideIndex = useAppStore((s) => s.setActiveSlideIndex);
  const exportToPPTX = useAppStore((s) => s.exportToPPTX);
  
  const [exportError, setExportError] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [subView, setSubView] = useState('preview'); // 'preview' | 'code' | 'split'
  const [slideError, setSlideError] = useState(null);

  // Restore persisted UI prefs
  useEffect(() => {
    try {
      const sv = localStorage.getItem('deck.subView');
      const sg = localStorage.getItem('deck.showGrid');
      if (sv === 'preview' || sv === 'code' || sv === 'split') setSubView(sv);
      else setSubView('code'); // default-to-code
      if (sg != null) setShowGrid(sg === 'true');
    } catch (_) {}
  }, []);

  // Persist changes
  useEffect(() => {
    try { localStorage.setItem('deck.subView', subView); } catch (_) {}
  }, [subView]);
  useEffect(() => {
    try { localStorage.setItem('deck.showGrid', String(showGrid)); } catch (_) {}
  }, [showGrid]);
  
  // Keyboard navigation and view toggles
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
        // Toggle code/preview quickly
        e.preventDefault();
        setSubView((v) => v === 'code' ? 'preview' : 'code');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, recipes, setActiveSlideIndex]);

  // Listen for iframe error messages
  useEffect(() => {
    const onMsg = (e) => {
      const d = e?.data;
      if (d && d.type === 'slide_error') {
        setSlideError(d.message || 'Slide error');
        // Auto-clear after a while
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
      setTimeout(() => setExportError(null), 5000); // Clear error after 5 seconds
    }
  };

  const renderDeckContent = () => {
    if (isLoading) {
      return (
        <div className="aspect-video bg-black/30 border border-white/10 rounded block">
          <AiIsGeneratingAnimation blueprint={blueprint} />
        </div>
      );
    }
    if (!recipes || recipes.length === 0) {
      return (
        <div className="aspect-video bg-black/30 rounded-lg flex items-center justify-center text-white/70">
          <div>
            <h3 className="text-xl font-semibold mb-2">Generation Complete</h3>
            <p>Your presentation is ready. Use the thumbnails on the left to navigate.</p>
          </div>
        </div>
      );
    }
    const current = recipes[activeIndex];
    if (subView === 'code') {
      return (
        <div className="aspect-video bg-black/30 border border-white/10 rounded block p-3">
          <CodePanel slide={current} blueprint={blueprint} />
        </div>
      );
    }
    if (subView === 'split') {
      return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div className="aspect-video bg-black/30 border border-white/10 rounded block">
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.slide_id || activeIndex}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full h-full"
              >
                <ThemeProvider className="w-full h-full">
                  <SlideRenderer recipe={{ ...current, theme_runtime: themeRuntime }} showGrid={showGrid} />
                </ThemeProvider>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="aspect-video bg-black/30 border border-white/10 rounded block p-3">
            <CodePanel slide={current} blueprint={blueprint} />
          </div>
        </div>
      );
    }
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
          <ThemeProvider className="w-full h-full bg-black/30 border border-white/10 rounded block">
            <SlideRenderer recipe={{ ...current, theme_runtime: themeRuntime }} showGrid={showGrid} />
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
          <div className="p-2 text-center text-white/50 text-sm">Generating slides...</div>
        )}
      </div>
      <div className="lg:col-span-3 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white/80">
            {isLoading ? 'AI is generating your presentation...' : `Slide ${activeIndex + 1} of ${recipes.length}`}
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-1 bg-black/30 border border-white/10 rounded-full p-1 mr-2">
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
                className={`px-3 py-1 text-sm rounded-full ${subView === 'split' ? 'bg-white text-black' : 'text-white/70 hover:bg-white/10'}`}
                onClick={() => setSubView('split')}
                disabled={isLoading || !recipes || recipes.length === 0}
              >
                Split
              </button>
            </div>
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
        {/* Error displays */}
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
        {renderDeckContent()}
      </div>
      <div className="lg:col-span-1 p-6 border-l border-white/10 bg-black/30">
        <h3 className="text-lg font-semibold mb-2">AI Assistant (MVP)</h3>
        <p className="text-sm text-white/70">@slideN tweaks can be added later. For now, switch slides and review.</p>
      </div>
    </div>
  );
}
