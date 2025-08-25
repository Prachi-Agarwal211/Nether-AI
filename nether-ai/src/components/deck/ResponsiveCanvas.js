'use client';

import React, { useRef, useState, useEffect } from 'react';

const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;

export default function ResponsiveCanvas({ children }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const scaleX = width / BASE_WIDTH;
      const scaleY = height / BASE_HEIGHT;
      setScale(Math.min(scaleX, scaleY));
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const scaledWidth = BASE_WIDTH * scale;
  const scaledHeight = BASE_HEIGHT * scale;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden p-4">
      {/* Wrapper matches the visual scaled size to prevent clipping */}
      <div className="relative" style={{ width: scaledWidth, height: scaledHeight }}>
        <div
          className="bg-transparent shadow-2xl"
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
