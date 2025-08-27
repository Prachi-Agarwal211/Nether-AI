'use client';
import { AlertTriangle } from 'lucide-react';

export function FallbackLayout({ title = 'Layout Render Error', errorMessage = 'Unable to render this slide.', recipe }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="max-w-lg w-full bg-black/40 border border-white/10 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-yellow-400" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="mt-3 text-sm text-white/80">{errorMessage}</p>
        {recipe?.layout_type && (
          <p className="mt-2 text-xs text-white/60">Requested layout: {String(recipe.layout_type)}</p>
        )}
      </div>
    </div>
  );
}
