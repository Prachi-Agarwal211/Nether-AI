'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as supabaseService from '@/services/supabaseService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await supabaseService.getUserProfile();
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Failed to load profile. Please check your connection and try again.');
      console.error('Profile fetch error:', err);
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e) => {
    const { name, id, value } = e.target;
    const key = name || id;
    setProfile({ ...profile, [key]: value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    try {
      await supabaseService.updateUserProfile(profile);
      toast.success('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-white/70" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        {/* Back to Dashboard */}
        <div className="mb-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full"
        >
          <div className="glass-card p-6 md:p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Account Details</h1>
            <p className="text-white/60 mb-8">Manage your personal information.</p>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="first_name"
                  name="first_name"
                  label="First Name"
                  value={profile?.first_name || ''}
                  onChange={handleInputChange}
                />
                <Input
                  id="last_name"
                  name="last_name"
                  label="Last Name"
                  value={profile?.last_name || ''}
                  onChange={handleInputChange}
                />
              </div>
               <Input
                  id="username"
                  name="username"
                  label="Username"
                  value={profile?.username || ''}
                  onChange={handleInputChange}
                />
              <Input
                id="email"
                name="email"
                label="Email Address"
                value={profile?.email || ''}
                disabled
                className="opacity-60 cursor-not-allowed"
              />
               <Input
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  value={profile?.phone || ''}
                  onChange={handleInputChange}
                />
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={updating} className="min-w-[120px]">
                  {updating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
