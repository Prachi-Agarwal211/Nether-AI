'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function AICopilotPanel({ onRefine, onFinalize, isProcessing }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'How can I refine this outline for you?' }
  ]);
  const [theme, setTheme] = useState('Tech'); 

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    onRefine(input, [...messages, { role: 'user', text: input }]);
    setInput('');
  };

  const themes = ['Tech', 'Minimalist', 'Corporate', 'Elegant'];

  return (
    <div className="h-full flex flex-col bg-black/20 border-r border-white/10 p-4">
      <h3 className="text-lg font-semibold mb-4">AI Co-pilot</h3>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded-lg text-sm ${msg.role === 'ai' ? 'bg-white/5' : 'bg-peachSoft/10 text-peachSoft'}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="e.g., Make it more professional"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          disabled={isProcessing}
        />
        <Button onClick={handleSend} disabled={isProcessing}>Send</Button>
      </div>
      
      <div className="mb-4">
        <label htmlFor="theme-select" className="block text-xs uppercase tracking-wider text-white/60 mb-2">
          Select a Design Theme
        </label>
        <select
          id="theme-select"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          disabled={isProcessing}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
        >
          {themes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      
      <Button onClick={() => onFinalize(theme)} disabled={isProcessing} className="w-full justify-center cta-glow">
        {isProcessing ? 'Generating...' : '✨ Design Presentation'}
      </Button>
    </div>
  );
}
