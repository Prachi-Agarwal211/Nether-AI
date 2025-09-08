'use client';

import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import VantaBackground from '@/components/shared/VantaBackground';
import { useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';

export default function DashboardLayout({ children }) {
  const { isLoading, isFullscreen } = useUIStore();
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    // Master grid: header, main content (fills space), footer
    <div className="h-screen w-screen grid grid-rows-[auto_1fr_auto] overflow-hidden">
      <VantaBackground />

      {/* Row 1: Header (hidden in fullscreen) */}
      {!isFullscreen && (
        <div className="relative z-20">
          <Header />
        </div>
      )}

      {/* Row 2: Main content */}
      <main className="relative z-10 overflow-hidden">
          {children}
      </main>

      {/* Row 3: Footer (hidden during workflows and in fullscreen to maximize space) */}
      {!isLoading && !isFullscreen && (
        <div className="relative z-20">
          <Footer />
        </div>
      )}
    </div>
  );
}