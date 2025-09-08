'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LayoutList, Wrench } from 'lucide-react';
import SlideRenderer from '../deck/SlideRenderer';
import { LoadingSpinner } from '../shared/LoadingSpinner';

const TabButton = ({ label, icon: Icon, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

const SlidePreview = ({ recipe, index, isActive, onSelect, itemRef }) => {
  return (
    <div 
      ref={itemRef}
      onClick={() => onSelect(index)}
      className="p-2 space-y-1"
    >
      <div className="pl-2 text-sm text-white/70">{index + 1}</div>
      <div 
        className={`w-full aspect-video rounded-md border-2 overflow-hidden relative group bg-black cursor-pointer transition-all duration-200 ${
          isActive ? 'border-peachSoft shadow-lg shadow-peachSoft/20' : 'border-transparent hover:border-white/30'
        }`}
      >
        <div 
          className="absolute top-0 left-0 origin-top-left"
          style={{
            width: '1280px',
            height: '720px',
            transform: 'scale(0.2)', // This scale can be adjusted for thumbnail size
            pointerEvents: 'none'
          }}
        >
          {recipe ? (
            <SlideRenderer recipe={recipe} animated={false} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black/40">
              <LoadingSpinner />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DeckSidebar({ slideRecipes, totalSlides, activeSlideIndex, onSlideSelect }) {
  const [activeTab, setActiveTab] = useState('slides');
  const slideRefs = useRef([]);

  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (activeTab === 'slides' && slideRefs.current[activeSlideIndex]) {
        slideRefs.current[activeSlideIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
  }, [activeSlideIndex, activeTab]);

  return (
    <div className="h-full w-full glass-card flex flex-col rounded-2xl">
      {/* Header with Tabs */}
      <div className="p-2 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center bg-black/20 rounded-lg p-1">
          <TabButton label="Slides" icon={LayoutList} isActive={activeTab === 'slides'} onClick={() => setActiveTab('slides')} />
          <TabButton label="Tools" icon={Wrench} isActive={activeTab === 'tools'} onClick={() => setActiveTab('tools')} />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'slides' && (
          <div className="p-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <SlidePreview 
                key={index}
                itemRef={el => slideRefs.current[index] = el}
                recipe={slideRecipes[index]}
                index={index}
                isActive={activeSlideIndex === index}
                onSelect={onSlideSelect}
              />
            ))}
          </div>
        )}
        {activeTab === 'tools' && (
          <div className="p-4">
            <div className="p-4 border border-white/10 rounded-lg">
              <h3 className="font-semibold text-white">Tools</h3>
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/10 text-white/70">Coming soon</span>
              <p className="mt-2 text-sm text-white/60">
                Advanced editing tools for your slides will be available here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}