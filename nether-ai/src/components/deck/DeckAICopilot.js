'use client';

import React from 'react';

export default function DeckAICopilot({ isOpen, onToggle }) {
  return (
    <div className={`h-full w-80 border border-white/10 bg-black/40 backdrop-blur-sm rounded-lg p-4 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)]'} absolute right-0 top-0`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">AI Copilot</h3>
        <button onClick={onToggle} className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20">
          {isOpen ? 'Close' : 'Open'}
        </button>
      </div>
      <div className="text-sm text-white/70 space-y-3 overflow-y-auto h-[calc(100%-2rem)] pr-1">
        <p>Ask the copilot to refine content, rewrite bullets, or adjust tone.</p>
        <ul className="list-disc list-inside space-y-1">
          <li>"Shorten this slide by 20%"</li>
          <li>"Rewrite bullets to be action-oriented"</li>
          <li>"Make tone more professional"</li>
        </ul>
      </div>
    </div>
  );
}
