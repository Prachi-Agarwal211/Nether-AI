'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function AICopilotPanel({ onRefine, onFinalize, isProcessing }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'How can I refine this outline for you?' }
  ]);

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    onRefine(input, [...messages, { role: 'user', text: input }]);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-black/20 border-r border-white/10 p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">AI Co-pilot</h3>
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
              msg.role === 'ai'
                ? 'bg-white/10 border border-white/10 text-white'
                : 'bg-gradient-to-r from-peachSoft/20 to-mauveLight/20 border border-peachSoft/30 text-white'
            }`}>
              {typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="e.g., Make it more professional"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:border-peachSoft/50 focus:outline-none"
          disabled={isProcessing}
        />
        <Button onClick={handleSend} disabled={isProcessing} variant="secondary">Send</Button>
      </div>
      <Button onClick={onFinalize} disabled={isProcessing} className="w-full justify-center pearl-button cta-glow">
        {isProcessing ? 'Generating...' : '✨ Design Presentation'}
      </Button>
    </div>
  );
}
