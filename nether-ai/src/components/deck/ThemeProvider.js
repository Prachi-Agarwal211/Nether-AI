'use client';

import React, { useEffect, useMemo } from 'react';
import { generateCssFromBrief } from '@/core/themeUtils';

export function useTheme() {
    // This hook is now a placeholder, as variables are global.
    // It can be expanded later if needed.
    return {}; 
}

export default function ThemeProvider({ children, designBrief }) {
  const themeCss = useMemo(() => {
    // If the brief is null or undefined, return an empty string to clear styles.
    if (!designBrief) return '';
    try {
      return generateCssFromBrief(designBrief);
    } catch (e) {
      console.warn('[ThemeProvider] Failed to generate CSS from Design Brief:', e);
      return '';
    }
  }, [designBrief]);

  useEffect(() => {
    let styleElement = document.getElementById('dynamic-theme-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'dynamic-theme-styles';
      document.head.appendChild(styleElement);
    }
    // This now correctly clears old styles when themeCss is empty.
    styleElement.textContent = themeCss;
  }, [themeCss]);

  const themeName = designBrief?.themeName || 'default';

  return (
    <div className={`theme-${themeName} w-full h-full`}>
      {children}
    </div>
  );
}
