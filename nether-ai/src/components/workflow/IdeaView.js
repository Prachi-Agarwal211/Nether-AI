'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { usePresentationStore } from '@/store/usePresentationStore';
import * as aiService from '@/services/aiService';
import Button from '@/components/ui/Button';

const AngleSkeleton = () => (
  <div className="rounded-lg border border-white/10 bg-white/5 p-4 animate-pulse">
    <div className="h-4 w-2/3 bg-white/10 rounded mb-3"></div>
    <div className="h-3 w-full bg-white/10 rounded mb-2"></div>
    <div className="h-3 w-5/6 bg-white/10 rounded"></div>
  </div>
);

export default function IdeaView() {
  const { setLoading, setError, setActiveView } = useUIStore();
  const { presentation, setTopic, setStrategicAngles, setChosenAngle, setBlueprint } = usePresentationStore();
  
  const { isLoading, error } = useUIStore();

  const handleGenerateAngles = async () => {
    if (!presentation.topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    setLoading(true);
    try {
      const result = await aiService.generateAngles(presentation.topic, { /* pass prefs here */ });
      setStrategicAngles(result.angles);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChooseAngle = async (angle) => {
    setLoading(true);
    setChosenAngle(angle);
    try {
      const result = await aiService.generateBlueprint(presentation.topic, angle, presentation.slideCount, { /* pass prefs */ });
      setBlueprint(result);
      setActiveView('outline');
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Start with an Idea</h1>
        <p className="text-lg text-white/70">Describe your presentation topic. Our AI will generate strategic angles for you.</p>
      </div>
      
      <div className="bg-black/30 border border-white/10 rounded-xl p-4 mb-8">
        <textarea
          value={presentation.topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., The future of renewable energy..."
          className="w-full h-24 bg-transparent text-lg text-white placeholder-white/40 resize-none outline-none p-2"
        />
        <div className="text-right mt-2">
          <Button onClick={handleGenerateAngles} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Angles'}
          </Button>
        </div>
      </div>

      {error && <div className="mb-8 text-center text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</div>}

      {/* Angle Cards Section with generative stagger */}
      <AnimatePresence>
        {presentation.strategicAngles.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
            initial="hidden"
            animate="visible"
          >
            {presentation.strategicAngles.map((angle) => (
              <motion.div
                key={angle.angle_id}
                variants={{ hidden: { opacity: 0, y: 20, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-card p-6 flex flex-col cursor-pointer text-white"
                onClick={() => handleChooseAngle(angle)}
              >
                <h3 className="font-bold text-xl mb-2 mother-of-pearl-text">{angle.title}</h3>
                <p className="text-white/80 flex-grow mb-4">{angle.description}</p>
                <Button variant="secondary" disabled={isLoading} className="mt-auto text-white">
                  Choose this Angle
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show skeletons while loading and no angles yet */}
      {isLoading && !presentation.strategicAngles.length && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <AngleSkeleton />
          <AngleSkeleton />
        </div>
      )}
    </motion.div>
  );
}
