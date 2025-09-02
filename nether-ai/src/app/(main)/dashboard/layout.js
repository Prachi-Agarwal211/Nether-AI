'use client';

import Header from '@/components/shared/Header';
import VantaBackground from '@/components/shared/VantaBackground';
import { useEffect } from 'react';

export default function DashboardLayout({ children }) {
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    // Master grid: header auto height, main fills remaining space; allow scrolling
    <div className="min-h-screen w-screen grid grid-rows-[auto_1fr]">
      <VantaBackground />

      {/* Row 1: Header */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Row 2: Main content */}
      <main className="relative z-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
