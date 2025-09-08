'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useUIStore } from '@/store/useUIStore';
import { usePresentationStore } from '@/store/usePresentationStore';
import { FaUserCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import * as supabaseService from '@/services/supabaseService';
import toast from 'react-hot-toast';
import ProfileDropdown from './ProfileDropdown';

export default function Header() {
  const { activeView, setActiveView } = useUIStore();
  const { presentation } = usePresentationStore();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const canViewOutline = !!presentation.blueprint;
  const canViewDeck = presentation.slideRecipes && presentation.slideRecipes.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await supabaseService.signOut();
      router.push('/'); // Redirect to login page
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setIsDropdownOpen(false);
    }
  };

  const NavButton = ({ viewId, label, enabled }) => {
    const isActive = activeView === viewId;
    return (
      <button
        onClick={() => enabled && setActiveView(viewId)}
        disabled={!enabled}
        className={`px-3 py-1.5 rounded-md text-sm transition-colors text-white ${
          isActive ? 'bg-white/10 ring-1 ring-white/30' : 'hover:bg-white/10'
        } ${!enabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        {label}
      </button>
    );
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 h-20 grid grid-cols-3 items-center">
        {/* Left Column: Logo & Name */}
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Image src="/logo.PNG" alt="Reverbex Technology Logo" width={48} height={48} className="opacity-100" />
          </motion.div>
          <div className="font-sans font-medium text-white/90 tracking-normal text-sm md:text-base text-heading-glow">NETHER AI</div>
        </div>

        {/* Center Column: Navigation */}
        <div className="flex justify-center items-center">
            <div className="flex items-center bg-black/30 border border-white/10 rounded-lg p-1 space-x-1">
                <NavButton viewId="idea" label="1. Idea" enabled={true} />
                <NavButton viewId="outline" label="2. Outline" enabled={canViewOutline} />
                <NavButton viewId="deck" label="3. Deck" enabled={canViewDeck} />
            </div>
        </div>
        
        {/* Right Column: User Icon & Dropdown */}
        <div className="flex justify-end" ref={dropdownRef}>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 5 }}
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <FaUserCircle className="w-6 h-6 text-white/80" />
          </motion.button>
          <AnimatePresence>
            {isDropdownOpen && <ProfileDropdown onSignOut={handleSignOut} />}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}