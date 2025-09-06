'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { generateCssFromBrief } from '@/core/themeUtils';

const ThemeContext = createContext();

export function ThemeProvider({ children, designBrief }) {
  const [themeName, setThemeName] = useState('default');

  const themeCss = useMemo(() => {
    if (!designBrief) return '';
    try {
      return generateCssFromBrief(designBrief);
    } catch (e) {
      console.warn('[ThemeProvider] Failed to generate CSS from Design Brief:', e);
      return '';
    }
  }, [designBrief]);

  useEffect(() => {
    if (designBrief?.themeName) {
      setThemeName(designBrief.themeName);
      
      let styleElement = document.getElementById('theme-variables');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'theme-variables';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = themeCss;
    }
  }, [designBrief, themeCss]);

  return (
    <ThemeContext.Provider value={designBrief}>
      <div className={`theme-${themeName} w-full h-full`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeProvider;
