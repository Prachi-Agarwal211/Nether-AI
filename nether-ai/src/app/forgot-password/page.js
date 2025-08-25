'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import VantaBackground from '@/components/shared/VantaBackground';
import AuthForm from '@/components/auth/AuthForm';

export default function ForgotPasswordPage() {
  const containerRef = useRef(null);
  const x = useMotionValue(200);
  const y = useMotionValue(200);
  const rotateX = useTransform(y, [0, 600], [3, -3]);
  const rotateY = useTransform(x, [0, 600], [-3, 3]);

  function handleMouseMove(event) {
    const rect = containerRef.current.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  return (
    <div className="min-h-screen w-full relative">
      <VantaBackground />
      <main
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="min-h-screen w-full flex items-center justify-center p-6 md:p-10 relative z-10"
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="w-full max-w-xl rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl p-6 md:p-8 shadow-2xl"
        >
          <div style={{ transform: 'translateZ(12px)' }}>
            <AuthForm view="forgotPassword" />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
