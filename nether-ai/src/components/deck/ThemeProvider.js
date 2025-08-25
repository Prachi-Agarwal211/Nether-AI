'use client';

import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children, theme }) {
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
