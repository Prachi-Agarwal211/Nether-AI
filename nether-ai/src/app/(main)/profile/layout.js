'use client';

import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import VantaBackground from '@/components/shared/VantaBackground';
import { useEffect } from 'react';

export default function ProfileLayout({ children }) {
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="h-screen w-screen grid grid-rows-[auto_1fr_auto] overflow-hidden">
      <VantaBackground />

      {/* Header */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Main */}
      <main className="relative z-10 overflow-auto">
        {children}
      </main>

      {/* Footer */}
      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
