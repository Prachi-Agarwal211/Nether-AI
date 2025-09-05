'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LayoutDashboard, LogOut } from 'lucide-react';

const ProfileDropdown = ({ onSignOut }) => {
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } }
  };

  return (
    <motion.div
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute top-16 right-4 w-48 bg-black/80 backdrop-blur-lg border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="p-2">
        <Link href="/profile" className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-white/80 rounded-md hover:bg-white/10 transition-colors">
          <LayoutDashboard size={16} />
          <span>Profile</span>
        </Link>
        <button
          onClick={onSignOut}
          className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-white/80 rounded-md hover:bg-white/10 transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ProfileDropdown;
