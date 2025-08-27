'use client';

import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children, theme, designSystem }) {
  // Apply global CSS variables based on the provided design system
  useEffect(() => {
    if (!designSystem) return;
    const root = document.documentElement;
    try {
      const { colorPalette = {}, typography = {}, styleTokens = {}, gradients = {} } = designSystem || {};
      Object.entries(colorPalette).forEach(([k, v]) => root.style.setProperty(`--color-${k}`, String(v)));
      Object.entries(typography).forEach(([k, v]) => root.style.setProperty(`--font-${k}`, String(v)));
      Object.entries(styleTokens).forEach(([k, v]) => root.style.setProperty(`--token-${k}`, String(v)));
      // Register gradients as CSS variables for flexible lookup
      Object.entries(gradients).forEach(([k, v]) => root.style.setProperty(`--gradient-${k}`, String(v)));
      // Back-compat shims
      if (gradients.backgroundGradient) root.style.setProperty('--background-gradient', String(gradients.backgroundGradient));
      if (gradients.titleGradient) root.style.setProperty('--title-gradient', String(gradients.titleGradient));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[ThemeProvider] Failed to apply design system variables:', e);
    }
  }, [designSystem]);

  return (
    <ThemeContext.Provider value={theme}>
      <div className={`theme-${theme?.name || 'default'} w-full h-full`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeProvider;
