'use client';

import React, { useMemo } from 'react';
import { useAppStore } from '@/utils/zustand-store';

/**
 * ThemeProvider maps GDS theme (palette + typography) to CSS variables on a wrapper <div>.
 * If a `theme` prop is provided, it takes precedence over the store blueprint theme.
 */
export default function ThemeProvider({ theme: themeProp, children, className = '' }) {
  const blueprintTheme = useAppStore((s) => s.presentation.blueprint?.theme);
  const theme = themeProp || blueprintTheme || {};

  const styleVars = useMemo(() => {
    const p = theme.palette || {};
    const t = theme.typography || {};
    const toColor = (v, fallback) => (typeof v === 'string' && v) || fallback;
    const toNum = (v, fallback) => (typeof v === 'number' && !Number.isNaN(v) ? v : fallback);

    return {
      // Palette
      '--gds-text-primary': toColor(p.text_primary, '#ffffff'),
      '--gds-text-secondary': toColor(p.text_secondary, '#d1d5db'),
      '--gds-bg-primary': toColor(p.background_primary, '#0b0b0f'),
      '--gds-bg-secondary': toColor(p.background_secondary, '#11131a'),
      '--gds-accent-primary': toColor(p.accent_primary, '#ffe1c6'),
      '--gds-accent-secondary': toColor(p.accent_secondary, '#fadadd'),
      '--gds-data-positive': toColor(p.data_positive, '#22c55e'),
      '--gds-data-negative': toColor(p.data_negative, '#ef4444'),
      '--gds-neutral': toColor(p.neutral, '#9ca3af'),

      // Typography
      '--gds-font-heading': t.heading_font || 'var(--font-geist-sans, system-ui)',
      '--gds-font-body': t.body_font || 'var(--font-geist-sans, system-ui)',
      '--gds-scale-heading': toNum(t.heading_scale, 1.2),
      '--gds-scale-body': toNum(t.body_scale, 1.06),
      '--gds-line-height': toNum(t.line_height, 1.4),
    };
  }, [theme]);

  return (
    <div className={className} style={styleVars}>
      {children}
    </div>
  );
}
