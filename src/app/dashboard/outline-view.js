'use client';

// OutlineView per MASTER_PLAN Section 4.2 with chat refinement (Section 18)
import { useState } from 'react';
import { useAppStore } from '@/utils/zustand-store';
import BlueprintDisplay from '@/components/BlueprintDisplay';

export default function OutlineView() {
  const blueprint = useAppStore((s) => s.presentation.blueprint);
  const isLoading = useAppStore((s) => s.isLoading);
  const generateRecipes = useAppStore((s) => s.generateRecipes);
  const refineBlueprintViaChat = useAppStore((s) => s.refineBlueprintViaChat);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // local UI history

  if (isLoading || !blueprint) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/70 mx-auto mb-4"></div>
          <div className="text-xl font-semibold mother-of-pearl-text mb-2">The AI is creating your presentation outline...</div>
          <div className="text-white/60">This may take a few moments</div>
        </div>
      </div>
    );
  }

  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatHistory((h) => [...h, { role: 'user', content: msg, timestamp: new Date().toISOString() }]);

    const updated = await refineBlueprintViaChat(msg);

    if (updated) {
      setChatHistory((h) => [...h, { role: 'assistant', content: 'Applied your changes.', timestamp: new Date().toISOString() }]);
    } else {
      setChatHistory((h) => [...h, { role: 'assistant', content: "That edit didn't go through. Try again or adjust your request.", timestamp: new Date().toISOString() }]);
    }
    setChatInput('');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2 p-6 overflow-y-auto">
        <BlueprintDisplay blueprint={blueprint} />
      </div>
      <div className="p-6 border-l border-white/10 bg-black/30 flex flex-col">
        <h3 className="text-lg font-semibold mb-2">AI Chat</h3>
        <div className="text-xs text-white/60 mb-4">Refine your presentation with AI.</div>
        <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
          {chatHistory.map((m, i) => (
            <div key={i} className={`text-sm ${m.role === 'user' ? 'text-white' : 'text-white/80'}`}>{m.role === 'user' ? 'You: ' : 'AI: '}{m.content}</div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white outline-none" placeholder="e.g., Make the tone more formal" />
          <button onClick={sendChat} className="primary-button">Send</button>
        </div>
        <hr className="my-4 border-white/10" />
        <button className="primary-button" onClick={() => generateRecipes()}>Finalize & Generate Presentation</button>
      </div>
    </div>
  );
}