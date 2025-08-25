'use client';

import React, { useState } from 'react';
import SlideRenderer from '@/components/deck/SlideRenderer';

export default function SharePresentationClient({ presentation }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'ArrowRight' || e.key === ' ') setIndex(Math.min(index + 1, presentation.recipes.length - 1));
      if (e.key === 'ArrowLeft') setIndex(Math.max(index - 1, 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, presentation.recipes.length]);

  const activeRecipe = presentation.recipes[index];

  return (
    <main className="w-screen h-screen bg-black p-8 flex flex-col items-center justify-center">
      <h1 className="text-2xl text-white/90 mb-4">{presentation.topic}</h1>
      <div className="w-full max-w-6xl aspect-video">
        {activeRecipe && <SlideRenderer recipe={activeRecipe} animated={true} />}
      </div>
      <div className="mt-4 text-white">
        <p>Slide {index + 1} of {presentation.recipes.length}</p>
      </div>
    </main>
  );
}
