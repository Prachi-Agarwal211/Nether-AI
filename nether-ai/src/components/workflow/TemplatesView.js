'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { usePresentationStore } from '@/store/usePresentationStore';
import Button from '@/components/ui/Button';
import { Copy, Star } from 'lucide-react';

// Pre-built templates
const templates = [
  {
    id: 'business-pitch',
    title: 'Business Pitch',
    description: 'Perfect for startup pitches and investor presentations',
    category: 'Business',
    slides: 12,
    preview: 'Business pitch template with market analysis, team, and financials',
    blueprint: {
      topic: 'Business Pitch Template',
      slides: [
        { slide_id: 'title', slide_title: 'Company Overview', objective: 'Introduce the company', content_points: ['Company name', 'Mission statement', 'Key value proposition'], visual_element: { type: 'TitleSlide' } },
        { slide_id: 'problem', slide_title: 'The Problem', objective: 'Define the problem', content_points: ['Market gap', 'Customer pain points', 'Current solutions'], visual_element: { type: 'TwoColumn' } },
        { slide_id: 'solution', slide_title: 'Our Solution', objective: 'Present the solution', content_points: ['Product features', 'Unique benefits', 'How it solves the problem'], visual_element: { type: 'FeatureGrid' } },
        { slide_id: 'market', slide_title: 'Market Opportunity', objective: 'Show market potential', content_points: ['Market size', 'Growth projections', 'Target segments'], visual_element: { type: 'DataChart' } },
        { slide_id: 'team', slide_title: 'Our Team', objective: 'Build credibility', content_points: ['Founders background', 'Key team members', 'Advisors'], visual_element: { type: 'TeamMembers' } },
        { slide_id: 'financials', slide_title: 'Financial Projections', objective: 'Show financial viability', content_points: ['Revenue projections', 'Cost structure', 'Break-even analysis'], visual_element: { type: 'KpiGrid' } },
        { slide_id: 'competition', slide_title: 'Competitive Advantage', objective: 'Differentiate from competitors', content_points: ['Competitor analysis', 'Our advantages', 'Barriers to entry'], visual_element: { type: 'ComparisonTable' } },
        { slide_id: 'roadmap', slide_title: 'Product Roadmap', objective: 'Show future plans', content_points: ['Current status', 'Next milestones', 'Long-term vision'], visual_element: { type: 'Timeline' } },
        { slide_id: 'ask', slide_title: 'Investment Ask', objective: 'State funding needs', content_points: ['Funding amount', 'Use of funds', 'Equity offered'], visual_element: { type: 'Quote' } },
        { slide_id: 'contact', slide_title: 'Contact Information', objective: 'Provide contact details', content_points: ['Email address', 'Phone number', 'Website'], visual_element: { type: 'ContactInfoLayout' } }
      ]
    },
    designSystem: {
      colorPalette: { primary: '#1e40af', secondary: '#3b82f6', accent: '#f59e0b' },
      typography: { headingFont: 'Inter', bodyFont: 'Inter' }
    }
  },
  {
    id: 'product-demo',
    title: 'Product Demo',
    description: 'Showcase your product features and benefits',
    category: 'Product',
    slides: 10,
    preview: 'Product demo template with features, benefits, and use cases',
    blueprint: {
      topic: 'Product Demo Template',
      slides: [
        { slide_id: 'title', slide_title: 'Product Introduction', objective: 'Introduce the product', content_points: ['Product name', 'Key features', 'Target audience'], visual_element: { type: 'TitleSlide' } },
        { slide_id: 'overview', slide_title: 'Product Overview', objective: 'Give high-level overview', content_points: ['Core functionality', 'Main benefits', 'Use cases'], visual_element: { type: 'TwoColumn' } },
        { slide_id: 'features', slide_title: 'Key Features', objective: 'Showcase main features', content_points: ['Feature 1', 'Feature 2', 'Feature 3'], visual_element: { type: 'FeatureGrid' } },
        { slide_id: 'demo', slide_title: 'Live Demo', objective: 'Demonstrate the product', content_points: ['Walkthrough steps', 'Key interactions', 'User flow'], visual_element: { type: 'FullBleedImageLayout' } },
        { slide_id: 'benefits', slide_title: 'Benefits & Value', objective: 'Explain value proposition', content_points: ['Time savings', 'Cost reduction', 'Productivity gains'], visual_element: { type: 'KpiGrid' } },
        { slide_id: 'comparison', slide_title: 'How It Compares', objective: 'Compare with alternatives', content_points: ['vs Competitor A', 'vs Competitor B', 'Our advantages'], visual_element: { type: 'ComparisonTable' } },
        { slide_id: 'pricing', slide_title: 'Pricing & Plans', objective: 'Show pricing options', content_points: ['Basic plan', 'Pro plan', 'Enterprise plan'], visual_element: { type: 'DataChart' } },
        { slide_id: 'testimonials', slide_title: 'What Users Say', objective: 'Build social proof', content_points: ['Customer quotes', 'Case studies', 'Success metrics'], visual_element: { type: 'Quote' } },
        { slide_id: 'roadmap', slide_title: 'Future Roadmap', objective: 'Show future development', content_points: ['Upcoming features', 'Timeline', 'Vision'], visual_element: { type: 'Timeline' } },
        { slide_id: 'cta', slide_title: 'Get Started Today', objective: 'Call to action', content_points: ['Free trial', 'Contact us', 'Next steps'], visual_element: { type: 'ContactInfoLayout' } }
      ]
    },
    designSystem: {
      colorPalette: { primary: '#059669', secondary: '#10b981', accent: '#f59e0b' },
      typography: { headingFont: 'Roboto', bodyFont: 'Roboto' }
    }
  },
  // Add more templates...
];

export default function TemplatesView() {
  const { setActiveView } = useUIStore();
  const { setTopic, setBlueprint, setDesignSystem, setSlideCount } = usePresentationStore();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(templates.map(t => t.category))];

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleForkTemplate = (template) => {
    setTopic(template.blueprint.topic);
    setBlueprint(template.blueprint);
    setDesignSystem(template.designSystem);
    setSlideCount(template.slides);
    setActiveView('outline');
  };

  return (
    <div className="h-full w-full overflow-auto p-6">
      <div className="text-center mb-10">
        <h1 className="font-sans font-medium text-white/90 text-3xl md:text-4xl mb-2">Presentation Templates</h1>
        <p className="text-base text-white/70">Choose from our pre-built templates to get started quickly</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{template.title}</h3>
                <span className="inline-block px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                  {template.category}
                </span>
              </div>
              <div className="flex items-center text-yellow-400">
                <Star size={16} fill="currentColor" />
                <span className="text-sm ml-1">4.8</span>
              </div>
            </div>

            <p className="text-white/70 text-sm mb-4 flex-grow">{template.description}</p>

            <div className="flex items-center justify-between text-xs text-white/60 mb-4">
              <span>{template.slides} slides</span>
              <span>Professional</span>
            </div>

            <Button
              onClick={() => handleForkTemplate(template)}
              className="w-full justify-center"
            >
              <Copy size={16} className="mr-2" />
              Use This Template
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Custom Option */}
      <div className="text-center mt-12">
        <p className="text-white/70 mb-4">Don&apos;t see what you need?</p>
        <Button onClick={() => setActiveView('idea')} className="justify-center">
          Start from Scratch
        </Button>
      </div>
    </div>
  );
}