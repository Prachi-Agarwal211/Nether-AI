'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { usePresentationStore } from '@/store/usePresentationStore';
import * as aiService from '@/services/aiService';
import Button from '@/components/ui/Button';
import InspirationPanel from './InspirationPanel';
import { Paperclip, Sparkles } from 'lucide-react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import toast from 'react-hot-toast';

// Configure the PDF.js worker to avoid build issues in Next.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const AngleSkeleton = () => (
  <div className="rounded-lg border border-white/10 bg-white/5 p-4 animate-pulse">
    <div className="h-4 w-2/3 bg-white/10 rounded mb-3"></div>
    <div className="h-3 w-full bg-white/10 rounded mb-2"></div>
    <div className="h-3 w-5/6 bg-white/10 rounded"></div>
  </div>
);

export default function IdeaView() {
  const { setLoading, setError, setActiveView } = useUIStore();
  const { presentation, setTopic, setStrategicAngles, setChosenAngle, setBlueprint, setSlideCount } = usePresentationStore();
  
  const { isLoading, error } = useUIStore();
  const fileInputRef = useRef(null);

  // Cleanup file input on unmount
  useEffect(() => {
    return () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
  }, []);

  const handleGenerateAngles = async () => {
    if (!presentation.topic.trim()) {
      const msg = "Please enter a topic.";
      setError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      const result = await aiService.generateAngles(presentation.topic, { count: 4, pptOptimized: true });
      setStrategicAngles(result.angles);
      toast.success("Strategic angles generated successfully!");
    } catch (e) {
      setError(e.message);
      toast.error(`Failed to generate angles: ${e.message}`);
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
      toast.success("Blueprint generated successfully!");
    } catch(e) {
      setError(e.message);
      toast.error(`Failed to generate blueprint: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map(item => item.str).join(' ') + '\n';
        }
        text = fullText.trim();
      } else if (file.name.toLowerCase().endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = (result.value || '').trim();
      } else if (file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.md')) {
        text = (await file.text()).trim();
      } else {
        throw new Error('Unsupported file. Please use PDF, DOCX, or TXT files.');
      }

      if (!text) throw new Error('No text could be extracted from the file.');

      const prefix = presentation.topic ? `${presentation.topic}\n\n--- Document Content ---\n` : '';
      setTopic(`${prefix}${text}`);
      toast.success("Document uploaded and processed successfully!");
    } catch (e) {
      setError(`Error parsing file: ${e.message}`);
      toast.error(`File upload failed: ${e.message}`);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="text-center mb-10">
        <h1 className="font-sans font-medium text-white/90 text-3xl md:text-4xl mb-2">Start with an Idea</h1>
        <p id="topic-description" className="text-base text-white/70">Describe your topic or upload a document. Our AI will generate strategic angles for you.</p>
        <p id="generate-description" className="sr-only">Click to generate strategic angles for your presentation topic</p>
        <div className="mt-6">
          <Button onClick={() => setActiveView('templates')} variant="secondary" className="justify-center">
            <Sparkles size={16} className="mr-2" />
            Browse Templates
          </Button>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Left Column: Generator */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative bg-black/30 border border-white/10 rounded-xl p-6 mb-6">
            <textarea
              value={presentation.topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The future of renewable energy..."
              className="w-full h-32 bg-transparent text-lg text-white placeholder-white/40 resize-none outline-none p-2"
              aria-label="Presentation topic input"
              aria-describedby="topic-description"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.docx,.txt,.md"
            />
            {/* Controls row */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Slide count</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={6}
                    max={30}
                    step={1}
                    value={presentation.slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-full accent-white"
                    aria-label="Number of slides"
                    aria-valuemin={6}
                    aria-valuemax={30}
                    aria-valuenow={presentation.slideCount}
                  />
                  <div className="w-12 text-right text-sm text-white/80">{presentation.slideCount}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleFileSelect}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition"
                  title="Attach document"
                  aria-label="Attach document"
                >
                  <Paperclip size={18} />
                </button>
                <Button
                  onClick={handleGenerateAngles}
                  disabled={isLoading}
                  className="pearl-button cta-glow"
                  aria-describedby="generate-description"
                >
                  {isLoading ? 'Generating…' : 'Generate Angles'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Inspiration Panel */}
        <InspirationPanel />
      </div>

      {/* Error Message */}
      {error && <div className="mb-8 text-center text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/20">{error}</div>}

      {/* Angle Cards Section with generative stagger */}
      <AnimatePresence>
        {presentation.strategicAngles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">Choose Your Strategic Angle</h2>
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
                  whileHover={{ y: -8, scale: 1.03, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                  className="glass-card p-6 flex flex-col cursor-pointer text-white border-2 border-transparent hover:border-white/20 transition-all duration-300"
                  onClick={() => !isLoading && handleChooseAngle(angle)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Choose angle: ${angle.title}`}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
                      handleChooseAngle(angle);
                    }
                  }}
                >
                  <h3 className="font-sans font-medium text-white/90 text-xl mb-4">{angle.title}</h3>
                  <ul className="space-y-3 list-inside list-disc text-white/80 flex-grow mb-6 pl-2">
                    {(angle.key_points || []).map((point, index) => (
                      <li key={index} className="text-sm leading-relaxed">{point}</li>
                    ))}
                  </ul>
                  <Button disabled={isLoading} className="mt-auto w-full justify-center pearl-button">
                    Choose this Angle
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show skeletons while loading and no angles yet */}
      {isLoading && !presentation.strategicAngles.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">Generating Strategic Angles...</h2>
            <p className="text-white/60">Our AI is analyzing your topic to create the best presentation angles</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AngleSkeleton />
            <AngleSkeleton />
            <AngleSkeleton />
            <AngleSkeleton />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
