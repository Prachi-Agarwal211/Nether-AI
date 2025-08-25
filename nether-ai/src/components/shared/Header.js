'use client';
import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { usePresentationStore } from '@/store/usePresentationStore';
import { FaUserCircle } from 'react-icons/fa';

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) setHidden(true);
    else setHidden(false);
  });
  const { activeView, setActiveView } = useUIStore();
  const { presentation } = usePresentationStore();

  const canViewOutline = !!presentation.blueprint;
  const canViewDeck = presentation.slideRecipes && presentation.slideRecipes.length > 0;

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
      variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10"
   >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="text-xl font-bold mother-of-pearl-text">Nether AI</div>
        <div className="flex items-center bg-black/30 border border-white/10 rounded-lg p-1 space-x-1">
          <NavButton viewId="idea" label="1. Idea" enabled={true} />
          <NavButton viewId="outline" label="2. Outline" enabled={canViewOutline} />
          <NavButton viewId="deck" label="3. Deck" enabled={canViewDeck} />
        </div>
        <div>
          <button className="p-2 rounded-full hover:bg-white/10">
            <FaUserCircle className="w-6 h-6 text-white/80" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
