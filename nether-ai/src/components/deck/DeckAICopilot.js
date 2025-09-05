'use client';

import React from 'react';

export default function DeckAICopilot({ activeSlide }) {
  const title = activeSlide?.props?.title || activeSlide?.slide_title || 'Current Slide';

  return (
    <div className="h-full w-full bg-transparent flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h3 className="font-semibold text-white">AI Co‑pilot</h3>
        <p className="text-xs text-white/60">Context-aware assistant for the selected slide.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Slide context */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="text-xs text-white/60 mb-1">Active slide</div>
          <div className="text-sm text-white/90 font-medium truncate" title={title}>{title}</div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button className="w-full text-sm text-left px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 text-white/90 transition-colors">
            Improve bullets
          </button>
          <button className="w-full text-sm text-left px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 text-white/90 transition-colors">
            Add speaker notes
          </button>
          <button className="w-full text-sm text-left px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 text-white/90 transition-colors">
            Suggest imagery
          </button>
        </div>

        {/* Guidance */}
        <div className="pt-2 text-xs text-white/70 space-y-1">
          <p>Try prompts:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Rewrite bullets to be action‑oriented</li>
            <li>Make tone more executive</li>
            <li>Summarize into 3 key points</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
