'use client';
import DeckBackground from './DeckBackground';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { usePresentationStore } from '@/store/usePresentationStore';
import * as Layouts from './layouts';

export default function SlideRenderer({ recipe, animated = true }) {
  const { presentation } = usePresentationStore();
  const { designSystem } = presentation;

  // Cleanup animation references
  useEffect(() => {
    return () => {
      // Cleanup any animation resources
    };
  }, []);

  if (!recipe) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  const LayoutComponent = Layouts[recipe.layout_type] || Layouts.FallbackLayout;
  const props = {
    ...recipe.props,
    animated,
    ...(LayoutComponent === Layouts.FallbackLayout && { recipe, errorMessage: `Layout "${recipe.layout_type}" not found.` })
  };

  // The ThemeProvider is GONE from here. It now lives in DeckView.
  return (
    <div className="relative w-full h-full overflow-hidden">
      <DeckBackground 
        designSystem={designSystem} 
        backgroundVariant={recipe?.backgroundVariant}
        slideId={recipe?.slide_id}
        animated={animated} 
      />
      <div className="relative z-10 w-full h-full">
        <LayoutComponent {...props} />
      </div>
    </div>
  );
}
