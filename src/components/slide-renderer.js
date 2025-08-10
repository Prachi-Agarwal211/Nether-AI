// src/components/slide-renderer.js
'use client';

import React from 'react';
import Image from 'next/image';

function Title({ content, style_hints = {} }) {
  const size = style_hints.size === 'xl' ? 'text-5xl' : style_hints.size === 'lg' ? 'text-4xl' : 'text-3xl';
  const accent = style_hints.accent ? 'mother-of-pearl-text' : '';
  const weight = style_hints.weight === 'bold' ? 'font-bold' : 'font-semibold';
  const align = style_hints.align === 'center' ? 'text-center' : style_hints.align === 'right' ? 'text-right' : 'text-left';
  return <h1 className={`${size} ${weight} ${accent} ${align}`} style={{ color: 'var(--gds-text-primary)', fontFamily: 'var(--gds-font-heading)', lineHeight: 'var(--gds-line-height)' }}>{content}</h1>;
}

function BulletedList({ content = [], style_hints = {} }) {
  const align = style_hints.align === 'center' ? 'text-center' : style_hints.align === 'right' ? 'text-right' : 'text-left';
  return (
    <ul className={`list-disc pl-5 space-y-1 ${align}`} style={{ color: 'var(--gds-text-secondary)', fontFamily: 'var(--gds-font-body)', lineHeight: 'var(--gds-line-height)' }}>
      {(content || []).slice(0, 5).map((item, idx) => (
        <li key={idx} className="text-sm md:text-base">
          {String(item)}
        </li>
      ))}
    </ul>
  );
}

function Paragraph({ content, style_hints = {} }) {
  const align = style_hints.align === 'center' ? 'text-center' : style_hints.align === 'right' ? 'text-right' : 'text-left';
  return <p className={`text-base leading-relaxed ${align}`} style={{ color: 'var(--gds-text-secondary)', fontFamily: 'var(--gds-font-body)', lineHeight: 'var(--gds-line-height)' }}>{content}</p>;
}

function Quote({ content }) {
  return <blockquote className="border-l-2 border-white/20 pl-3 italic" style={{ color: 'var(--gds-text-secondary)', fontFamily: 'var(--gds-font-body)', lineHeight: 'var(--gds-line-height)' }}>{content}</blockquote>;
}

function Stat({ content, style_hints = {} }) {
  const value = typeof content === 'object' ? content.value : content;
  const description = typeof content === 'object' ? content.description : '';
  return (
    <div>
      <div className="text-4xl font-bold" style={{ color: 'var(--gds-accent-primary)', fontFamily: 'var(--gds-font-heading)' }}>{value}</div>
      {description ? <div style={{ color: 'var(--gds-text-secondary)', fontFamily: 'var(--gds-font-body)' }}>{description}</div> : null}
    </div>
  );
}

function Callout({ content }) {
  if (!content) return null;
  const title = typeof content === 'object' ? content.title : '';
  const text = typeof content === 'object' ? content.text : String(content);
  return (
    <div className="rounded-lg border border-white/15 bg-white/5 p-3">
      {title ? <div className="text-white font-semibold mb-1">{title}</div> : null}
      <div className="text-white/85 text-sm">{text}</div>
    </div>
  );
}

function ImageEl({ content, alt, style_hints = {} }) {
  if (!content) return null;
  const fit = style_hints.fit === 'cover' ? 'object-cover' : 'object-contain';
  return (
    <div className="relative w-full h-full">
      <Image alt={alt || 'slide image'} src={content} fill className={`${fit} rounded`} unoptimized />
    </div>
  );
}

function TableEl({ table }) {
  if (!table) return null;
  const headers = table.headers || [];
  const rows = table.rows || [];
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-white/90 text-sm">
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="text-left py-1 px-2 border-b border-white/10">{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className="py-1 px-2 border-b border-white/5">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DiagramEl({ diagram }) {
  // Placeholder: render code block or simple box for MVP
  if (!diagram) return null;
  return (
    <pre className="text-xs bg-white/5 rounded p-2 text-white/80 overflow-auto">{diagram.code || 'diagram'}</pre>
  );
}

function renderGenerativeBackground(containerEl, gen) {
  if (!gen || !containerEl) return false;
  try {
    // Clear any previous generated canvas/background
    if (containerEl.__genCanvas && containerEl.contains(containerEl.__genCanvas)) {
      containerEl.removeChild(containerEl.__genCanvas);
      containerEl.__genCanvas = null;
    }
    switch ((gen.library || '').toLowerCase()) {
      case 'gradient-js': {
        const angle = gen.options?.angle || '180deg';
        const colors = Array.isArray(gen.options?.colors) ? gen.options.colors : [];
        if (colors.length >= 2) {
          containerEl.style.backgroundImage = `linear-gradient(${angle}, ${colors.join(', ')})`;
          return true;
        }
        return false;
      }
      case 'noise-canvas': {
        // Simple animated noise on a canvas background
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.style.position = 'absolute';
        canvas.style.inset = '0';
        canvas.style.zIndex = '-1';
        const resize = () => {
          canvas.width = containerEl.clientWidth;
          canvas.height = containerEl.clientHeight;
        };
        resize();
        containerEl.style.position = 'relative';
        containerEl.prepend(canvas);
        containerEl.__genCanvas = canvas;
        let rafId;
        const density = Number(gen.options?.density || 0.08); // fraction of pixels filled per frame
        const alpha = Number(gen.options?.alpha || 15); // 0-255
        const draw = () => {
          if (!ctx) return;
          const w = canvas.width, h = canvas.height;
          const imageData = ctx.createImageData(w, h);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const on = Math.random() < density;
            const val = on ? Math.floor(Math.random() * 256) : 0;
            data[i] = val; // R
            data[i + 1] = val; // G
            data[i + 2] = val; // B
            data[i + 3] = on ? alpha : 0; // A
          }
          ctx.putImageData(imageData, 0, 0);
          rafId = requestAnimationFrame(draw);
        };
        draw();
        // Handle resize
        const onResize = () => resize();
        window.addEventListener('resize', onResize);
        // Attach cleanup
        canvas.__cleanup = () => {
          cancelAnimationFrame(rafId);
          window.removeEventListener('resize', onResize);
        };
        return true;
      }
      default:
        return false;
    }
  } catch (_) {
    return false;
  }
}

export function SlideRenderer({ recipe, showGrid = false }) {
  if (!recipe) return null;
  const bg = recipe?.background?.color || 'transparent';
  const gen = recipe?.background?.generative_background;
  const primary = recipe?.theme_runtime?.primary || '#ffffff';
  const secondary = recipe?.theme_runtime?.secondary || '#cccccc';
  const accent = recipe?.theme_runtime?.accent || '#ffe1c6';

  return (
    <div className="w-full h-full p-6" style={{ background: bg, color: primary, '--color-primary': primary, '--color-secondary': secondary, '--color-accent': accent }} ref={(el) => {
      if (!el) return;
      // Try to initialize a generative background if specified
      if (gen) {
        const ok = renderGenerativeBackground(el, gen);
        if (!ok) {
          // fallback remains the solid color
        }
      }
    }}>
      <div className="relative w-full h-full">
        {/* Optional design grid overlay */}
        {showGrid && (
          <div className="pointer-events-none absolute inset-0" aria-hidden="true"
            style={{
              backgroundImage: `repeating-linear-gradient(to right, rgba(255,255,255,0.06) 0 1px, transparent 1px 1fr), repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0 1px, transparent 1px 16px)`,
              backgroundSize: `calc(100% / 12) 100%, 100% 16px`,
            }}
          />
        )}
        <div className="w-full h-full grid" style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gridAutoRows: 'minmax(16px, auto)', gap: '12px' }}>
          {(recipe.elements || []).map((el, idx) => {
            const style = el.grid ? {
              gridColumn: `${Math.max(1, el.grid.colStart || 1)} / ${Math.min(13, el.grid.colEnd || 13)}`,
              gridRow: `${Math.max(1, el.grid.rowStart || 1)} / ${Math.max(2, el.grid.rowEnd || (el.grid.rowStart || 1) + 1)}`,
            } : { gridColumn: '1 / -1' };
            const aria = el.accessibility?.aria_label ? { 'aria-label': el.accessibility.aria_label } : {};
            switch (el.type) {
              case 'Title':
                return <div key={idx} style={style} {...aria}><Title content={el.content} style_hints={el.style_hints} /></div>;
              case 'BulletedList':
                return <div key={idx} style={style} {...aria}><BulletedList content={el.content} style_hints={el.style_hints} /></div>;
              case 'Paragraph':
                return <div key={idx} style={style} {...aria}><Paragraph content={el.content} style_hints={el.style_hints} /></div>;
              case 'Quote':
                return <div key={idx} style={style} {...aria}><Quote content={el.content} /></div>;
              case 'Image':
                return <div key={idx} style={style} className="min-h-24" {...aria}><ImageEl content={el.content} alt={el.accessibility?.alt} style_hints={el.style_hints} /></div>;
              case 'Diagram':
                return <div key={idx} style={style} {...aria}><DiagramEl diagram={el.diagram} /></div>;
              case 'Table':
                return <div key={idx} style={style} {...aria}><TableEl table={el.table} /></div>;
              case 'Stat':
                return <div key={idx} style={style} {...aria}><Stat content={el.content} style_hints={el.style_hints} /></div>;
              case 'Callout':
                return <div key={idx} style={style} {...aria}><Callout content={el.content} /></div>;
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
