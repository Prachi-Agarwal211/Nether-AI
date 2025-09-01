'use client';

import { useState } from 'react';
import { usePresentationStore } from '@/store/usePresentationStore';
import Button from './Button';
import { Palette, Type, X } from 'lucide-react';
import toast from 'react-hot-toast';

const FONT_OPTIONS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Nunito', 'Source Sans Pro', 'Raleway', 'Ubuntu', 'PT Sans'
];

const COLOR_PRESETS = [
  { name: 'Blue', primary: '#1e40af', secondary: '#3b82f6', accent: '#f59e0b' },
  { name: 'Green', primary: '#059669', secondary: '#10b981', accent: '#f59e0b' },
  { name: 'Purple', primary: '#7c3aed', secondary: '#a855f7', accent: '#f59e0b' },
  { name: 'Red', primary: '#dc2626', secondary: '#ef4444', accent: '#fbbf24' },
  { name: 'Orange', primary: '#ea580c', secondary: '#f97316', accent: '#3b82f6' },
  { name: 'Teal', primary: '#0d9488', secondary: '#14b8a6', accent: '#f59e0b' }
];

export default function DesignSystemEditor({ isOpen, onClose }) {
  const { presentation, setDesignSystem } = usePresentationStore();
  const [tempDesign, setTempDesign] = useState(presentation.designSystem || {
    colorPalette: { primary: '#1e40af', secondary: '#3b82f6', accent: '#f59e0b' },
    typography: { headingFont: 'Inter', bodyFont: 'Inter' }
  });

  const handleSave = () => {
    setDesignSystem(tempDesign);
    toast.success('Design system updated successfully!');
    onClose();
  };

  const handleColorChange = (key, value) => {
    // Validate hex color format
    const hexRegex = /^#[0-9A-F]{6}$/i;
    if (!hexRegex.test(value)) {
      toast.error('Please enter a valid hex color (e.g., #FF0000)');
      return;
    }

    setTempDesign(prev => ({
      ...prev,
      colorPalette: { ...prev.colorPalette, [key]: value }
    }));
  };

  const handleFontChange = (key, value) => {
    setTempDesign(prev => ({
      ...prev,
      typography: { ...prev.typography, [key]: value }
    }));
  };

  const applyPreset = (preset) => {
    setTempDesign(prev => ({
      ...prev,
      colorPalette: { primary: preset.primary, secondary: preset.secondary, accent: preset.accent }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/90 border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <Palette size={24} className="mr-3" />
              Customize Design System
            </h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-2"
              aria-label="Close editor"
            >
              <X size={24} />
            </button>
          </div>

          {/* Color Presets */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-4">Color Presets</h3>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="p-3 rounded-lg border border-white/10 hover:border-white/30 transition-colors"
                >
                  <div className="flex space-x-1 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }}></div>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }}></div>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }}></div>
                  </div>
                  <span className="text-sm text-white/80">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-4">Custom Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Primary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={tempDesign.colorPalette.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-12 h-10 rounded border border-white/10 bg-transparent"
                  />
                  <input
                    type="text"
                    value={tempDesign.colorPalette.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Secondary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={tempDesign.colorPalette.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="w-12 h-10 rounded border border-white/10 bg-transparent"
                  />
                  <input
                    type="text"
                    value={tempDesign.colorPalette.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Accent Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={tempDesign.colorPalette.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="w-12 h-10 rounded border border-white/10 bg-transparent"
                  />
                  <input
                    type="text"
                    value={tempDesign.colorPalette.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Type size={20} className="mr-2" />
              Typography
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Heading Font</label>
                <select
                  value={tempDesign.typography.headingFont}
                  onChange={(e) => handleFontChange('headingFont', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  style={{ fontFamily: tempDesign.typography.headingFont }}
                >
                  {FONT_OPTIONS.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Body Font</label>
                <select
                  value={tempDesign.typography.bodyFont}
                  onChange={(e) => handleFontChange('bodyFont', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  style={{ fontFamily: tempDesign.typography.bodyFont }}
                >
                  {FONT_OPTIONS.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-4">Preview</h3>
            <div
              className="p-6 rounded-lg border border-white/10"
              style={{
                background: `linear-gradient(135deg, ${tempDesign.colorPalette.primary}20, ${tempDesign.colorPalette.secondary}20)`,
                fontFamily: tempDesign.typography.bodyFont
              }}
            >
              <h4
                className="text-xl font-bold mb-3"
                style={{
                  color: tempDesign.colorPalette.primary,
                  fontFamily: tempDesign.typography.headingFont
                }}
              >
                Sample Heading
              </h4>
              <p className="text-white/80 mb-3">
                This is how your text will look with the selected fonts and colors.
              </p>
              <button
                className="px-4 py-2 rounded text-white text-sm"
                style={{ backgroundColor: tempDesign.colorPalette.accent }}
              >
                Sample Button
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}