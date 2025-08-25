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
    email: '', password: '', firstName: '', lastName: '', username: '', dob: '', phone: ''
  });

  const handleInputChange = (e) => setFormState({ ...formState, [e.target.name]: e.target.value });

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (view === 'signIn') {
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

  const renderContent = () => {
    switch (view) {
      case 'signUp':
        return (
          <motion.div key="signUp" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6 md:space-y-7">
            <div className="text-center mb-2">
              <h2 className="text-3xl font-bold">Create Account</h2>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <Input id="firstName" name="firstName" label="First Name" value={formState.firstName} onChange={handleInputChange} />
              <Input id="lastName" name="lastName" label="Last Name" value={formState.lastName} onChange={handleInputChange} />
            </div>
            <Input id="email" name="email" type="email" label="Email Address" value={formState.email} onChange={handleInputChange} />
            <div className="relative">
              <Input id="password" name="password" type={showPassword ? 'text' : 'password'} label="Password" value={formState.password} onChange={handleInputChange} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-white/50 hover:text-white"><FiEye /></button>
            </div>
            <button type="submit" disabled={loading} className="primary-button w-full">
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </motion.div>
        );
      // ... (Forgot Password view can be added similarly) ...
      default: // signIn view
        return (
          <motion.div key="signIn" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
            <div className="text-center mb-2">
              <h2 className="text-3xl font-bold">Sign In</h2>
            </div>
            <Input id="email" name="email" type="email" label="Email Address" value={formState.email} onChange={handleInputChange} />
            <div className="relative">
              <Input id="password" name="password" type={showPassword ? 'text' : 'password'} label="Password" value={formState.password} onChange={handleInputChange} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-white/50 hover:text-white">{showPassword ? <FiEyeOff/> : <FiEye />}</button>
            </div>
            <button type="submit" disabled={loading} className="pearl-button w-full">
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
            <div className="my-6 flex items-center"><div className="flex-grow border-t border-white/10" /><span className="mx-4 text-xs text-white/50">OR</span><div className="flex-grow border-t border-white/10" /></div>
            <button type="button" onClick={() => supabaseService.signInWithGoogle()} disabled={loading} className="primary-button w-full">
              <span className="inline-flex items-center gap-3"><FaGoogle className="h-4 w-4" /> Continue with Google</span>
            </button>
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
      {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
      {message && <p className="mt-4 text-center text-sm text-green-400">{message}</p>}
    </div>
  );
}

