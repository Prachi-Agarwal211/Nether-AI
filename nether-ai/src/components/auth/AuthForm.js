'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import * as supabaseService from '@/services/supabaseService';

// Controlled by parent: expects `view` ('signIn' | 'signUp') and optional `setView`
export default function AuthForm({ view = 'signIn', setView }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState({
    email: '', password: '', confirmPassword: '', firstName: '', lastName: '', username: '', dob: '', phone: ''
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleInputChange = (e) => setFormState({ ...formState, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    if (view !== 'forgotPassword') {
      if (!formState.email) errs.email = 'Email is required';
      else if (!emailRegex.test(formState.email)) errs.email = 'Enter a valid email';
    } else {
      if (!formState.email) errs.email = 'Email is required';
      else if (!emailRegex.test(formState.email)) errs.email = 'Enter a valid email';
    }
    if (view === 'signIn') {
      if (!formState.password) errs.password = 'Password is required';
    }
    if (view === 'signUp') {
      if (!formState.firstName) errs.firstName = 'First name is required';
      if (!formState.lastName) errs.lastName = 'Last name is required';
      if (!formState.password) errs.password = 'Password is required';
      else if (formState.password.length < 8) errs.password = 'Min 8 characters';
      if (!formState.confirmPassword) errs.confirmPassword = 'Confirm your password';
      else if (formState.password !== formState.confirmPassword) errs.confirmPassword = 'Passwords do not match';
      // Optional fields: validate basic format if provided
      if (formState.phone && !/^\+?[0-9\-\s()]{7,}$/.test(formState.phone)) errs.phone = 'Enter a valid phone number';
      if (formState.username && formState.username.length < 3) errs.username = 'Username should be at least 3 characters';
      if (!termsAccepted) errs.terms = 'You must accept the Terms and Privacy Policy';
    }
    if (view === 'forgotPassword') {
      // email validated above
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (!validate()) {
        throw new Error('Please fix the highlighted fields.');
      }
      if (view === 'signIn') {
        // Persist rememberMe preference for the Supabase client storage selection
        if (typeof window !== 'undefined') {
          try { window.localStorage.setItem('rememberMe', String(rememberMe)); } catch {}
        }
        await supabaseService.signIn(formState.email, formState.password);
      } else if (view === 'signUp') {
        await supabaseService.signUpWithDetails(formState); // Use a new detailed function
        setMessage('Confirmation link sent! Please check your email.');
      } else if (view === 'forgotPassword') {
        await supabaseService.sendPasswordReset(formState.email);
        setMessage('Password reset link sent!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const passwordStrength = () => {
    const p = formState.password || '';
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score; // 0-5
  };

  const renderContent = () => {
    switch (view) {
      case 'signUp':
        return (
          <motion.div key="signUp" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-7 md:space-y-8">
            <div className="text-center mb-1">
              <h2 className="text-3xl font-medium tracking-normal">Create Account</h2>
              <p className="text-white/60 text-xs mt-1">Start designing AI-powered presentations in minutes</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Input id="firstName" name="firstName" label="First Name" value={formState.firstName} onChange={handleInputChange} error={fieldErrors.firstName} />
              <Input id="lastName" name="lastName" label="Last Name" value={formState.lastName} onChange={handleInputChange} error={fieldErrors.lastName} />
            </div>
            <Input id="email" name="email" type="email" label="Email Address" value={formState.email} onChange={handleInputChange} error={fieldErrors.email} />
            <div className="flex items-center my-1">
              <div className="flex-grow border-t border-white/10" />
              <span className="mx-3 text-[11px] text-white/60 px-2 py-0.5 rounded-full border border-white/10 bg-white/5">Optional</span>
              <div className="flex-grow border-t border-white/10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input id="username" name="username" label="Username" placeholder="Optional" value={formState.username} onChange={handleInputChange} error={fieldErrors.username} />
              <Input id="phone" name="phone" label="Phone" placeholder="Optional" value={formState.phone} onChange={handleInputChange} error={fieldErrors.phone} />
            </div>
            <div className="grid grid-cols-1 gap-6">
              <Input id="dob" name="dob" type="date" label="Date of Birth" value={formState.dob} onChange={handleInputChange} />
              <p className="-mt-3 text-[11px] leading-4 text-white/50">Optional details help personalize your account.</p>
            </div>
            <div className="relative">
              <Input id="password" name="password" type={showPassword ? 'text' : 'password'} label="Password" value={formState.password} onChange={handleInputChange} error={fieldErrors.password} className="pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-white/50 hover:text-white">{showPassword ? <FiEyeOff/> : <FiEye />}</button>
            </div>
            {formState.password ? (
              <p className="-mt-2 text-[11px] leading-4 text-white/60">Strength: {['Very Weak','Weak','Okay','Good','Strong','Very Strong'][passwordStrength()]}</p>
            ) : (
              <p className="-mt-2 text-[11px] leading-4 text-white/50">Use 8+ characters with a mix of letters, numbers, and symbols</p>
            )}
            <Input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} label="Confirm Password" value={formState.confirmPassword} onChange={handleInputChange} error={fieldErrors.confirmPassword} />
            <label className="flex items-start gap-3 text-sm text-white/80">
              <input type="checkbox" className="mt-1" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
              <span>
                I agree to the <a href="/terms" className="underline" target="_blank" rel="noreferrer">Terms of Service</a> and <a href="/privacy" className="underline" target="_blank" rel="noreferrer">Privacy Policy</a>.
                {fieldErrors.terms && (<span className="block text-red-400 text-xs mt-1">{fieldErrors.terms}</span>)}
              </span>
            </label>
            <button type="submit" disabled={loading} className="primary-button w-full">
              {loading ? 'Creating…' : 'Create Account'}
            </button>
            <p className="text-center text-sm text-white/60">
              Already have an account?{' '}
              <button type="button" className="underline hover:text-white" onClick={() => setView?.('signIn')}>Sign in</button>
            </p>
          </motion.div>
        );
      case 'forgotPassword':
        return (
          <motion.div key="forgotPassword" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6 md:space-y-7">
            <div className="text-center mb-1">
              <h2 className="text-3xl font-medium tracking-normal">Reset password</h2>
              <p className="text-white/60 text-xs mt-1">Enter your email and we will send you a reset link.</p>
            </div>
            <Input id="email" name="email" type="email" label="Email Address" value={formState.email} onChange={handleInputChange} error={fieldErrors.email} />
            <button type="submit" disabled={loading} className="primary-button w-full">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <p className="text-center text-sm text-white/60">
              Remembered it?{' '}
              <button type="button" className="underline hover:text-white" onClick={() => setView?.('signIn')}>Back to sign in</button>
            </p>
          </motion.div>
        );
      default: // signIn view
        return (
          <motion.div key="signIn" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-7">
            <div className="text-center mb-1">
              <h2 className="text-3xl font-medium tracking-normal">Sign In</h2>
              <p className="text-white/60 text-xs mt-1">Welcome back! Please enter your details</p>
            </div>
            <Input id="email" name="email" type="email" label="Email Address" value={formState.email} onChange={handleInputChange} error={fieldErrors.email} />
            <div className="relative">
              <Input id="password" name="password" type={showPassword ? 'text' : 'password'} label="Password" value={formState.password} onChange={handleInputChange} error={fieldErrors.password} className="pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-white/50 hover:text-white">{showPassword ? <FiEyeOff/> : <FiEye />}</button>
            </div>
            <label className="flex items-center justify-between text-sm text-white/70">
              <span className="inline-flex items-center gap-2">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                Remember me
              </span>
              <button type="button" className="underline hover:text-white" onClick={() => setView?.('forgotPassword')}>Forgot password?</button>
            </label>
            <button type="submit" disabled={loading} className="pearl-button w-full">
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
            <div className="my-5 flex items-center">
              <div className="flex-grow border-t border-white/10" />
              <span className="mx-3 text-[11px] text-white/60 px-2 py-0.5 rounded-full border border-white/10 bg-white/5">OR</span>
              <div className="flex-grow border-t border-white/10" />
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') { try { window.localStorage.setItem('rememberMe', String(rememberMe)); } catch {} }
                supabaseService.signInWithGoogle();
              }}
              disabled={loading}
              className="primary-button w-full"
            >
              <span className="inline-flex items-center gap-3"><FaGoogle className="h-4 w-4" /> Continue with Google</span>
            </button>
            <p className="text-center text-sm text-white/60">
              New here?{' '}
              <button type="button" className="underline hover:text-white" onClick={() => setView?.('signUp')}>Create an account</button>
            </p>
          </motion.div>
        );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        <form onSubmit={handleAuthAction}>
          {renderContent()}
        </form>
      </AnimatePresence>
      {error && <p className="mt-4 text-center text-sm text-red-400" role="alert" aria-live="assertive">{error}</p>}
      {message && <p className="mt-4 text-center text-sm text-green-400" role="status" aria-live="polite">{message}</p>}
    </div>
  );
}
