'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePresentationStore } from '@/store/usePresentationStore';
import { createClient } from '@supabase/supabase-js';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import toast from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ThemesView({ onClose }) {
  const [themes, setThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setSelectedTheme } = usePresentationStore();

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const { data, error } = await supabase
          .from('themes')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setThemes(data || []);
      } catch (e) {
        console.error('Failed to fetch themes:', e);
        toast.error('Failed to load themes');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchThemes();
  }, []);

  const handleSelectTheme = (theme) => {
    setSelectedTheme(theme.design_brief);
    toast.success(`Theme "${theme.theme_name}" selected`);
    if (onClose) onClose();
  };

  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Theme Library</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            Close
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : themes.length === 0 ? (
        <div className="text-center text-white/70 py-12">
          No themes found in the library
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {themes.map((theme) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="rounded-xl overflow-hidden border border-white/10"
              >
                <div 
                  className="h-32 w-full"
                  style={{ 
                    background: theme.preview_colors?.bg || '#000000',
                    color: theme.preview_colors?.text || '#ffffff'
                  }}
                >
                  <div className="p-4 h-full flex flex-col justify-between">
                    <h3 className="font-bold text-lg truncate">{theme.theme_name}</h3>
                    <div className="flex gap-2">
                      {['bg', 'text', 'accent'].map((color) => (
                        <div 
                          key={color}
                          className="h-6 w-6 rounded-full border border-white/20"
                          style={{ 
                            backgroundColor: theme.preview_colors?.[color] || '#3b82f6'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white/5">
                  <button
                    onClick={() => handleSelectTheme(theme)}
                    className="w-full pearl-button !py-2"
                  >
                    Use This Theme
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
