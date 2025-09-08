'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import * as aiService from '@/services/aiService';
import { Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeckAICopilot({ activeSlide, onUpdateSlide }) {
  const { isLoading, setLoading, setError } = useUIStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const slideTitle = activeSlide?.props?.title || activeSlide?.slide_title || 'Current Slide';

  // Reset chat when the active slide changes
  useEffect(() => {
    setMessages([
      { role: 'ai', text: `Editing "${slideTitle}". How can I help you refine this slide?` }
    ]);
  }, [activeSlide, slideTitle]);

  const handleSend = async (messageToSend) => {
    if (!messageToSend.trim() || isLoading || !activeSlide) return;

    const newMessages = [...messages, { role: 'user', text: messageToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const updatedRecipe = await aiService.refineSlide(activeSlide, messageToSend);
      onUpdateSlide(updatedRecipe); // Update the global state
      setMessages(prev => [...prev, { role: 'ai', text: "I've updated the slide for you. Anything else?" }]);
      toast.success('Slide updated successfully!');
    } catch (e) {
      const errorMsg = `Failed to refine slide: ${e.message}`;
      setError(errorMsg);
      setMessages(prev => [...prev, { role: 'ai', text: `Sorry, I couldn't make that change: ${e.message}` }]);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const suggestionPrompts = [
    "Improve the bullet points",
    "Add detailed speaker notes",
    "Suggest better imagery",
    "Make the tone more executive"
  ];

  return (
    <div className="h-full w-full bg-transparent flex flex-col">
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <h3 className="font-semibold text-white">AI Co‑pilot</h3>
        <p className="text-xs text-white/60">Context-aware assistant for the selected slide.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Active Slide Context */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 sticky top-0 backdrop-blur-sm">
          <div className="text-xs text-white/60 mb-1">Active slide</div>
          <div className="text-sm text-white/90 font-medium truncate" title={slideTitle}>{slideTitle}</div>
        </div>
        
        {/* Chat Messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-xl text-sm ${
              msg.role === 'ai'
                ? 'bg-white/10 border border-white/15 text-white'
                : 'bg-gradient-to-r from-peachSoft/20 to-mauveLight/20 border border-peachSoft/30 text-white'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="p-3 rounded-xl bg-white/10 border border-white/15 text-white">
                    <Loader2 className="w-4 h-4 animate-spin" />
                </div>
            </div>
        )}
      </div>

      <div className="p-4 space-y-3 border-t border-white/10 flex-shrink-0">
        {/* Suggestion Buttons */}
        <div className="grid grid-cols-2 gap-2">
            {suggestionPrompts.map((prompt) => (
                <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    disabled={isLoading || !activeSlide}
                    className="text-left text-xs p-2 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                    {prompt}
                </button>
            ))}
        </div>
        
        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Rewrite the title..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:border-peachSoft/50 focus:outline-none"
            disabled={isLoading || !activeSlide}
          />
          <button type="submit" disabled={isLoading || !input.trim() || !activeSlide} className="pearl-button !p-3 !rounded-lg disabled:opacity-50">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}