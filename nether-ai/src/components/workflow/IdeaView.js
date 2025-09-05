'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { usePresentationStore } from '@/store/usePresentationStore';
import * as aiService from '@/services/aiService';
import InspirationPanel from './InspirationPanel';
import { Plus, Paperclip, Send, X } from 'lucide-react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../shared/LoadingSpinner';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

// Left Sidebar Component
const ChatHistorySidebar = ({ isSidebarOpen, setIsSidebarOpen, recent, onNewChat, onSelect }) => {
  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col md:w-64 flex-shrink-0`}>
        <div className="flex flex-col h-full bg-transparent border-r border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white text-heading-glow">History</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/70 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <button onClick={onNewChat} className="pearl-button w-full justify-start gap-2 mb-4 !rounded-lg !px-3 !py-2">
            <Plus size={16} /> New Chat
          </button>
          <div className="flex-1 overflow-y-auto space-y-2">
            {recent && recent.length > 0 ? (
              recent.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect?.(item)}
                  className="w-full p-3 text-sm text-white/80 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer truncate text-left interactive-item"
                  title={item.title || item.topic}
                >
                  {item.title || item.topic}
                  <div className="text-[10px] text-white/40 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-sm text-white/70 rounded-lg bg-white/5">
                Your chat history will appear here as you create presentations.
              </div>
            )}
          </div>
          <div className="text-xs text-white/50 text-center mt-4">Recent chats are stored locally.</div>
        </div>
      </div>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
    </>
  );
};

const AngleCards = ({ angles, onChooseAngle, isLoading }) => {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {angles.map((angle) => (
        <motion.div
          key={angle.angle_id}
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
          className="group glass-card p-5 flex flex-col cursor-pointer text-white border-2 border-transparent hover:border-white/20 transition-all duration-300"
          onClick={() => !isLoading && onChooseAngle(angle)}
          role="button"
          tabIndex={0}
          aria-label={`Choose angle: ${angle.title}`}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
              onChooseAngle(angle);
            }
          }}
        >
          <h3 className="font-sans font-medium text-white/90 text-md mb-3">{angle.title}</h3>
          <ul className="space-y-2 list-inside list-disc text-white/80 flex-grow mb-4 pl-1">
            {(angle.key_points || []).map((point, index) => (
              <li key={index} className="text-xs leading-relaxed">{point}</li>
            ))}
          </ul>
          <div className="text-center text-xs font-semibold text-peachSoft opacity-80 group-hover:opacity-100 transition-opacity">
            Choose this Angle →
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default function IdeaView() {
  const { setLoading, setError, setActiveView } = useUIStore();
  const { presentation, setTopic, setStrategicAngles, setChosenAngle, setBlueprint, setSlideCount, resetPresentation, addRecentPresentation } = usePresentationStore();
  const { isLoading } = useUIStore();

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const [messages, setMessages] = useState([
    { type: 'ai', text: "Welcome to Nether AI. What presentation shall we create today? Describe your topic or upload a document to begin." }
  ]);
  const [inputTopic, setInputTopic] = useState('');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sidebar actions (correct scope inside IdeaView)
  const handleNewChat = () => {
    resetPresentation();
    setMessages([{ type: 'ai', text: "Welcome to Nether AI. What presentation shall we create today? Describe your topic or upload a document to begin." }]);
    setInputTopic('');
  };

  const handleSelectRecent = (item) => {
    // Prefill the input and chat with the selected topic
    if (item?.topic) {
      setTopic(item.topic);
      setInputTopic(item.topic);
      setMessages([
        { type: 'ai', text: "Welcome back. You can refine or create a new presentation for this topic." },
        { type: 'user', text: item.topic },
      ]);
    }
  };

  const handleSendMessage = async (topicToSend) => {
    if (!topicToSend.trim()) return;

    setMessages(prev => [...prev, { type: 'user', text: topicToSend }]);
    setTopic(topicToSend);
    setInputTopic('');
    setLoading(true);

    try {
      const result = await aiService.generateAngles(topicToSend, { count: 4, pptOptimized: true });
      setStrategicAngles(result.angles);
      setMessages(prev => [...prev, {
        type: 'ai',
        text: "Excellent. I've generated a few strategic angles for your presentation. Which one resonates the most with you?"
      }, {
        type: 'angles',
        angles: result.angles
      }]);
      toast.success("Strategic angles generated!");
    } catch (e) {
      const errorMsg = `Failed to generate angles: ${e.message}`;
      setError(errorMsg);
      setMessages(prev => [...prev, { type: 'ai', text: `Sorry, I encountered an error: ${e.message}` }]);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseAngle = async (angle) => {
    setLoading(true);
    setChosenAngle(angle);
    setMessages(prev => [...prev, { type: 'ai', text: `Great choice! Generating a blueprint based on the "${angle.title}" angle.` }]);

    try {
      const result = await aiService.generateBlueprint(presentation.topic, angle, presentation.slideCount);
      setBlueprint(result);
      // Record recent presentation
      addRecentPresentation({ title: angle.title, topic: presentation.topic });
      setActiveView('outline');
      toast.success("Blueprint generated successfully!");
    } catch (e) {
      const errorMsg = `Failed to generate blueprint: ${e.message}`;
      setError(errorMsg);
      setMessages(prev => [...prev, { type: 'ai', text: `Sorry, I couldn't generate the blueprint: ${e.message}` }]);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    const toastId = toast.loading('Processing document...');
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        text = (await Promise.all(Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1).then(page => page.getTextContent()))))
          .map(content => content.items.map(item => item.str).join(' ')).join('\n');
      } else if (file.name.toLowerCase().endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value || '';
      } else if (file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.md')) {
        text = await file.text();
      } else {
        throw new Error('Unsupported file. Please use PDF, DOCX, or TXT files.');
      }

      if (!text.trim()) throw new Error('No text could be extracted from the file.');
      
      toast.dismiss(toastId);
      handleSendMessage(text.trim());

    } catch (e) {
      setError(`Error parsing file: ${e.message}`);
      toast.error(`File upload failed: ${e.message}`, { id: toastId });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
    
  return (
    <div className="h-full w-full flex overflow-hidden transition-opacity duration-300">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Generating your presentation blueprint...</p>
        </div>
      ) : (
        <div className="h-full w-full flex overflow-hidden">
          <ChatHistorySidebar 
            isSidebarOpen={isSidebarOpen} 
            setIsSidebarOpen={setIsSidebarOpen}
            recent={presentation.recentPresentations}
            onNewChat={handleNewChat}
            onSelect={handleSelectRecent}
          />

          <main className="flex-1 flex flex-col h-full relative">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.3, delay: 0.1 * index }} 
                    layout
                  >
                    {msg.type === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-xl p-4 rounded-xl bg-gradient-to-r from-peachSoft/20 to-mauveLight/20 border border-peachSoft/30 text-white/90">
                          {msg.text}
                        </div>
                      </div>
                    ) : msg.type === 'ai' ? (
                      <div className="flex justify-start">
                        <div className="max-w-xl p-4 rounded-xl bg-white/5 border border-white/15 text-white/90">
                          {msg.text}
                        </div>
                      </div>
                    ) : msg.type === 'angles' ? (
                      <AngleCards angles={msg.angles} onChooseAngle={handleChooseAngle} isLoading={isLoading} />
                    ) : null}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && messages.slice(-1)[0]?.type === 'user' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/15 text-white/90">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="px-6 pb-6">
              <div className={`glass-card p-3 transition-all duration-300 ${isInputFocused ? 'input-bar-focus' : ''}`}>
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputTopic); }} className="flex items-center gap-3">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.txt,.md" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition" title="Attach document">
                    <Paperclip size={18} />
                  </button>
                  <input
                    value={inputTopic}
                    onChange={(e) => setInputTopic(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="Describe your presentation topic..."
                    className="w-full bg-transparent text-white placeholder-white/40 outline-none"
                    disabled={isLoading}
                  />
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <label className="text-xs text-white/60">Slides:</label>
                    <input
                      type="range"
                      min={6}
                      max={30}
                      step={1}
                      value={presentation.slideCount}
                      onChange={(e) => setSlideCount(Number(e.target.value))}
                      className="w-24 accent-white"
                      disabled={isLoading}
                      aria-label="Number of slides"
                    />
                    <span className="w-8 text-center text-sm text-white/80">{presentation.slideCount}</span>
                  </div>
                  <motion.button 
                    type="submit" 
                    disabled={isLoading || !inputTopic.trim()} 
                    className="pearl-button !p-3 !rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Send size={18} />
                  </motion.button>
                </form>
              </div>
            </div>
          </main>

          {/* Right-side Inspiration Panel (now permanent on desktop) */}
          <motion.aside
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:block w-96 flex-shrink-0 h-full overflow-y-auto p-4"
          >
            <InspirationPanel />
          </motion.aside>
        </div>
      )}
    </div>
  );
}
