'use client';

import React from 'react';

export default function DeckAICopilot({ activeSlide }) {
  const title = activeSlide?.props?.title || activeSlide?.slide_title || 'Current Slide';

  return (
    <div className="h-full w-80 border border-white/10 bg-black/40 backdrop-blur-sm rounded-lg p-4 flex flex-col">
      <div className="mb-3">
        <h3 className="font-semibold text-white">AI Co‑pilot</h3>
        <p className="text-xs text-white/60">Context-aware assistant for the selected slide.</p>
      </div>

      {/* Slide context */}
      <div className="glass-card border border-white/10 rounded-lg p-3 mb-3">
        <div className="text-xs text-white/60 mb-1">Active slide</div>
        <div className="text-sm text-white/90 font-medium truncate" title={title}>{title}</div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button className="w-full text-sm px-3 py-2 rounded bg-white/10 hover:bg-white/15 text-white/90">
          Improve bullets
        </button>
        <button className="w-full text-sm px-3 py-2 rounded bg-white/10 hover:bg-white/15 text-white/90">
          Add speaker notes
        </button>
        <button className="w-full text-sm px-3 py-2 rounded bg-white/10 hover:bg-white/15 text-white/90">
          Suggest imagery
        </button>
      </div>

      {/* Guidance */}
      <div className="mt-4 text-xs text-white/70 space-y-1 overflow-y-auto">
        <p>Try prompts:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Rewrite bullets to be action‑oriented</li>
          <li>Make tone more executive</li>
          <li>Summarize into 3 key points</li>
        </ul>
      </div>
    </div>
  );
}
