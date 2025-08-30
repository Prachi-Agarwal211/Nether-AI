'use client';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import AuthForm from '@/components/auth/AuthForm';
import { useEffect, useRef, useState } from 'react';
import { getClient } from '@/utils/supabase-client';
import { useRouter } from 'next/navigation';
import VantaBackground from '@/components/shared/VantaBackground';
import Image from 'next/image';

export default function SignInPage() {
  const router = useRouter();
  const containerRef = useRef(null);
  const [view, setView] = useState('signIn'); // 'signIn' | 'signUp'

  // Redirect if user is already logged in
  useEffect(() => {
    const supabase = getClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.push('/dashboard');
    });
    return () => subscription.unsubscribe();
  }, [router]);

  // Spotlight cursor variables (match dashboard layout)
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 3D Tilt Effect Logic (extra subtle)
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
    <div className="h-screen w-full relative overflow-hidden">
      <VantaBackground />
      <main
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="h-full w-full flex items-center justify-center p-4 md:p-8 relative z-10"
      >
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Brand side */}
          <div className="text-center space-y-5">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur">
              <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-white/70">Live • Beta access</span>
            </div>
            <h1 className="font-sans font-medium text-white/90 leading-tight text-5xl md:text-6xl tracking-normal">NETHER AI</h1>
            <div className="text-white/60 text-sm md:text-base">by</div>
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="Nether AI Logo"
                width={240}
                height={240}
                priority
                className="opacity-100 brightness-125 contrast-110 drop-shadow-lg scale-125 md:scale-150 will-change-transform pointer-events-none select-none"
              />
            </div>
            <p className="text-white/70 text-base md:text-lg">The future of presentation design. Generate strategic angles, blueprints, and slides in minutes.</p>
          </div>

          {/* Auth side */}
          <motion.div
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className={`rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl p-6 md:p-8 shadow-2xl ${
              view === 'signUp' || view === 'forgotPassword' ? 'max-h-[85vh] overflow-auto' : 'max-h-none overflow-visible'
            }`}
          >
            <div style={{ transform: 'translateZ(12px)' }}>
              {/* Tabs */}
              <div className="mb-4 md:mb-6 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setView('signIn')}
                  className={`px-4 py-2 rounded-full text-sm border transition ${
                    view === 'signIn'
                      ? 'border-white/40 bg-white/10'
                      : 'border-white/15 hover:border-white/25'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setView('signUp')}
                  className={`px-4 py-2 rounded-full text-sm border transition ${
                    view === 'signUp'
                      ? 'border-white/40 bg-white/10'
                      : 'border-white/15 hover:border-white/25'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <AuthForm view={view} setView={setView} />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
