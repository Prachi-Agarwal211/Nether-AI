'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { usePresentationStore } from '@/store/usePresentationStore';

import Button from '@/components/ui/Button';
import { Copy, Star, Lightbulb } from 'lucide-react';

// Featured templates (subset from TemplatesView)
const featuredTemplates = [
  {
    id: 'business-pitch',
    title: 'Business Pitch',
    description: 'Perfect for startup pitches and investor presentations',
    category: 'Business',
    slides: 12,
  },
  {
    id: 'product-demo',
    title: 'Product Demo',
    description: 'Showcase your product features and benefits',
    category: 'Product',
    slides: 10,
  },
  {
    id: 'academic-lecture',
    title: 'Academic Lecture',
    description: 'Structure your research and findings for academic audiences',
    category: 'Education',
    slides: 15,
  },
];

// Example prompts
const examplePrompts = [
  "A business plan for a drone delivery startup",
  "A lecture on the history of ancient Rome",
  "A product roadmap for a new mobile app",
  "A marketing strategy for a sustainable fashion brand",
  "A scientific presentation on climate change impacts",
];

export default function InspirationPanel() {
  const { setActiveView } = useUIStore();
  const { presentation, setTopic } = usePresentationStore();

  const handleUseTemplate = (template) => {
    setTopic(`${template.title} presentation`);
    setActiveView('idea');
  };

  const handleUseExample = (prompt) => {
    setTopic(prompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Featured Templates */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Star className="mr-2 text-yellow-400" size={20} />
          Featured Templates
        </h3>
        <div className="space-y-3">
          {featuredTemplates.map((template) => (
            <div
              key={template.id}
              className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => handleUseTemplate(template)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">{template.title}</h4>
                  <p className="text-white/60 text-xs mt-1">{template.description}</p>
                  <div className="flex items-center mt-2 text-xs text-white/50">
                    <span>{template.slides} slides</span>
                    <span className="mx-2">•</span>
                    <span>{template.category}</span>
                  </div>
                </div>
                <Copy size={14} className="text-white/40 ml-2" />
              </div>
            </div>
          ))}
        </div>
        <Button
          onClick={() => setActiveView('templates')}
          variant="secondary"
          className="w-full mt-4 justify-center"
        >
          Browse All Templates
        </Button>
      </div>

      {/* Example Prompts */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Lightbulb className="mr-2 text-yellow-400" size={20} />
          Example Prompts
        </h3>
        <div className="space-y-2">
          {examplePrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleUseExample(prompt)}
              className="w-full text-left p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-sm text-white/80 hover:text-white"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Recent Presentations (dynamic) */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Presentations</h3>
        {presentation.recentPresentations && presentation.recentPresentations.length > 0 ? (
          <div className="space-y-2">
            {presentation.recentPresentations.slice(0, 8).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-md border border-white/10">
                <div className="min-w-0">
                  <div className="text-sm text-white/90 truncate">{item.title || item.topic}</div>
                  <div className="text-[11px] text-white/50">{new Date(item.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="secondary" onClick={() => { setTopic(item.topic); setActiveView('idea'); }}>Open</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-white/60 text-sm">No recent presentations yet</p>
            <p className="text-white/40 text-xs mt-2">Create one to see it here</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}