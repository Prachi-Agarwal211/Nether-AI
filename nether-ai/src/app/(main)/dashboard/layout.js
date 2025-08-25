'use client';

import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
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
    <div className="flex flex-col min-h-screen">
      <VantaBackground />
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 z-10 relative">
        {children}
      </main>
      <Footer />
    </div>
  );
}
