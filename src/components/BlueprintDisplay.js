import React from 'react';

const BlueprintDisplay = ({ blueprint }) => {
  if (!blueprint) {
    return null;
  }

  const { topic, theme, slides } = blueprint;

  return (
    <div className="blueprint-container p-4 md:p-8 text-white">
      <h1 className="text-3xl md:text-4xl font-bold mother-of-pearl-text mb-4">{topic}: A Blueprint for an Inspirational Presentation</h1>
      
      {theme && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold border-b border-white/20 pb-2 mb-4">Theme and Color Scheme</h2>
          <p className="text-lg font-semibold">{theme.name}</p>
          <p className="text-white/80 mb-4">{theme.description}</p>
          <div className="flex flex-wrap gap-4">
            {theme.palette && Object.entries(theme.palette).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: value }}></div>
                <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold border-b border-white/20 pb-2 mb-4">The {slides.length}-Slide Presentation Blueprint</h2>
        <div className="space-y-8">
          {slides.map((slide, index) => (
            <div key={slide.slide_id} className="slide-section p-4 border border-white/10 rounded-lg">
              <h3 className="text-xl font-bold text-peachSoft mb-2">Slide {index + 1}: {slide.slide_title}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Content:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-white/90">
                    {slide.content_points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  {slide.visual_suggestion && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Visual:</h4>
                      <p className="text-white/80">{slide.visual_suggestion.description}</p>
                    </div>
                  )}
                  {slide.speaker_notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes:</h4>
                      <p className="text-white/80">{slide.speaker_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlueprintDisplay;