'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import VantaBackground from '@/components/shared/VantaBackground';
import Input from '@/components/ui/Input';
import { getClient } from '@/utils/supabase-client';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = getClient();
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

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ensure there's a recovery session; if not, redirect to sign-in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // In password recovery, Supabase should set a short-lived session from the link
        // If not available, send user to sign in
        router.replace('/');
      }
    });
  }, [router, supabase]);

  const validate = () => {
    const errs = {};
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Min 8 characters';
    if (!confirm) errs.confirm = 'Confirm your password';
    else if (password !== confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const errs = validate();
    if (Object.keys(errs).length) {
      setError('Please fix the highlighted fields.');
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage('Password updated successfully. Redirecting...');
      setTimeout(() => router.replace('/'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = () => {
    const p = password || '';
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

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
            <h2 className="text-3xl font-bold text-center mb-6">Set a new password</h2>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="relative">
                <Input
                  id="new_password"
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  helperText={password ? `Strength: ${['Very Weak','Weak','Okay','Good','Strong','Very Strong'][strength()]}` : ''}
                />
              </div>
              <Input
                id="confirm_password"
                label="Confirm Password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <button type="submit" disabled={loading} className="primary-button w-full">
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
            {error && <p className="mt-4 text-center text-sm text-red-400" role="alert" aria-live="assertive">{error}</p>}
            {message && <p className="mt-4 text-center text-sm text-green-400" role="status" aria-live="polite">{message}</p>}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
