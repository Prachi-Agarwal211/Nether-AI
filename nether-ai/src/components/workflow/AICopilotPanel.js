'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function AICopilotPanel({ onRefine, onFinalize, isProcessing }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'This is your presentation outline. How can I help you refine it?' }
  ]);

  const suggestionPrompts = [
    "Make the tone more professional",
    "Add a slide about our team",
    "Consolidate slides 4 and 5",
    "Focus more on the financial benefits"
  ];

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    onRefine(input, messages);
    setInput('');
  };

  const handleSuggestionClick = (prompt) => {
    setInput(prompt);
  };

  return (
    <div className="h-full flex flex-col bg-black/20">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">AI Co-pilot</h3>
        <p className="text-xs text-white/60">Refine your presentation outline</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
              msg.role === 'ai'
                ? 'bg-white/10 border border-white/15 text-white'
                : 'bg-gradient-to-r from-peachSoft/20 to-mauveLight/20 border border-peachSoft/30 text-white'
            }`}>
              {typeof msg.text === 'string' ? msg.text.split('\n').map((line, idx) => <p key={idx}>{line}</p>) : JSON.stringify(msg.text)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 space-y-3 border-t border-white/10">
         <div className="grid grid-cols-2 gap-2">
            {suggestionPrompts.map((prompt, i) => (
                <button 
                    key={i} 
                    onClick={() => handleSuggestionClick(prompt)}
                    disabled={isProcessing}
                    className="text-left text-xs p-2 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                    {prompt}
                </button>
            ))}
         </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="e.g., Change the title of slide 3..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:border-peachSoft/50 focus:outline-none"
            disabled={isProcessing}
          />
          <Button onClick={handleSend} disabled={isProcessing || !input.trim()} variant="secondary">Send</Button>
        </div>
        <Button onClick={onFinalize} disabled={isProcessing} className="w-full justify-center pearl-button cta-glow">
          {isProcessing ? 'Generating...' : '✨ Design Presentation'}
        </Button>
      </div>
    </div>
  );
}
