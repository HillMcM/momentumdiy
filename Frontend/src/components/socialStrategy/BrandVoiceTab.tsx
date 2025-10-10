import * as React from 'react';
import { useState } from 'react';
import type { BrandVoice, VisualStyle } from '../../types';

interface BrandVoiceTabProps {
  brandVoice: BrandVoice;
  visualStyle: VisualStyle;
  onBrandVoiceChange: (brandVoice: BrandVoice) => void;
  onVisualStyleChange: (visualStyle: VisualStyle) => void;
}

const TONE_SUGGESTIONS = [
  'Friendly', 'Professional', 'Casual', 'Formal', 'Witty', 'Inspirational',
  'Educational', 'Conversational', 'Authoritative', 'Playful', 'Empathetic', 'Bold'
];

const ADJECTIVE_SUGGESTIONS = [
  'Approachable', 'Knowledgeable', 'Trustworthy', 'Creative', 'Authentic',
  'Energetic', 'Warm', 'Confident', 'Helpful', 'Innovative', 'Reliable', 'Passionate'
];

export default function BrandVoiceTab({
  brandVoice,
  visualStyle,
  onBrandVoiceChange,
  onVisualStyleChange
}: BrandVoiceTabProps) {
  const [newTone, setNewTone] = useState('');
  const [newAdjective, setNewAdjective] = useState('');
  const [newColor, setNewColor] = useState('#EF8E81');

  const toggleTone = (tone: string) => {
    const tones = brandVoice.tone || [];
    if (tones.includes(tone)) {
      onBrandVoiceChange({ ...brandVoice, tone: tones.filter(t => t !== tone) });
    } else if (tones.length < 5) {
      onBrandVoiceChange({ ...brandVoice, tone: [...tones, tone] });
    }
  };

  const toggleAdjective = (adj: string) => {
    const adjectives = brandVoice.adjectives || [];
    if (adjectives.includes(adj)) {
      onBrandVoiceChange({ ...brandVoice, adjectives: adjectives.filter(a => a !== adj) });
    } else if (adjectives.length < 5) {
      onBrandVoiceChange({ ...brandVoice, adjectives: [...adjectives, adj] });
    }
  };

  const addCustomTone = () => {
    if (!newTone.trim()) return;
    const tones = brandVoice.tone || [];
    if (tones.length < 5 && !tones.includes(newTone.trim())) {
      onBrandVoiceChange({ ...brandVoice, tone: [...tones, newTone.trim()] });
      setNewTone('');
    }
  };

  const addCustomAdjective = () => {
    if (!newAdjective.trim()) return;
    const adjectives = brandVoice.adjectives || [];
    if (adjectives.length < 5 && !adjectives.includes(newAdjective.trim())) {
      onBrandVoiceChange({ ...brandVoice, adjectives: [...adjectives, newAdjective.trim()] });
      setNewAdjective('');
    }
  };

  const addColor = () => {
    const colors = visualStyle.colors || [];
    if (colors.length < 6 && !colors.includes(newColor)) {
      onVisualStyleChange({ ...visualStyle, colors: [...colors, newColor] });
    }
  };

  const removeColor = (color: string) => {
    onVisualStyleChange({
      ...visualStyle,
      colors: (visualStyle.colors || []).filter(c => c !== color)
    });
  };

  return (
    <div className="space-y-8">
      {/* Brand Voice Section */}
      <div>
        <h3 className="text-xl font-semibold text-[#FFF1E7] mb-2">Brand Voice</h3>
        <p className="text-[#FFF1E7]/60 text-sm mb-6">
          Define how your brand speaks on social media. Choose tone attributes and adjectives that describe your voice.
        </p>

        {/* Tone Selection */}
        <div className="mb-6">
          <label className="text-[#FFF1E7]/80 font-medium block mb-3">
            Tone ({(brandVoice.tone || []).length}/5)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {TONE_SUGGESTIONS.map(tone => (
              <button
                key={tone}
                onClick={() => toggleTone(tone)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  (brandVoice.tone || []).includes(tone)
                    ? 'bg-[#EF8E81] text-white'
                    : 'bg-[#2A2438] text-[#FFF1E7]/60 hover:bg-[#3A3448]'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTone}
              onChange={(e) => setNewTone(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomTone()}
              placeholder="Add custom tone..."
              className="flex-1 bg-[#2A2438] text-[#FFF1E7] px-4 py-2 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-sm"
            />
            <button
              onClick={addCustomTone}
              disabled={(brandVoice.tone || []).length >= 5}
              className="bg-[#EF8E81] hover:bg-[#E67A6E] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Adjectives Selection */}
        <div className="mb-6">
          <label className="text-[#FFF1E7]/80 font-medium block mb-3">
            Brand Adjectives ({(brandVoice.adjectives || []).length}/5)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {ADJECTIVE_SUGGESTIONS.map(adj => (
              <button
                key={adj}
                onClick={() => toggleAdjective(adj)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  (brandVoice.adjectives || []).includes(adj)
                    ? 'bg-[#10b981] text-white'
                    : 'bg-[#2A2438] text-[#FFF1E7]/60 hover:bg-[#3A3448]'
                }`}
              >
                {adj}
              </button>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newAdjective}
              onChange={(e) => setNewAdjective(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomAdjective()}
              placeholder="Add custom adjective..."
              className="flex-1 bg-[#2A2438] text-[#FFF1E7] px-4 py-2 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-sm"
            />
            <button
              onClick={addCustomAdjective}
              disabled={(brandVoice.adjectives || []).length >= 5}
              className="bg-[#10b981] hover:bg-[#0ea370] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Personality Notes */}
        <div className="mb-6">
          <label className="text-[#FFF1E7]/80 font-medium block mb-2">
            Personality & Voice Notes
          </label>
          <textarea
            value={brandVoice.personalityNotes || ''}
            onChange={(e) => onBrandVoiceChange({ ...brandVoice, personalityNotes: e.target.value })}
            placeholder="Describe your brand's personality in a short paragraph. For example: 'We speak in a casual, upbeat tone – like a helpful friend who has some expertise to share. We use emojis sparingly and keep our language simple and clear.'"
            className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-3 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] resize-none"
            rows={4}
          />
        </div>

        {/* Style Guide */}
        <div>
          <label className="text-[#FFF1E7]/80 font-medium block mb-2">
            Writing Style Guide
          </label>
          <textarea
            value={brandVoice.styleGuide || ''}
            onChange={(e) => onBrandVoiceChange({ ...brandVoice, styleGuide: e.target.value })}
            placeholder="Add specific style preferences (e.g., 'Use 'I' not 'we'', 'Always end with a call-to-action', 'Avoid jargon', etc.)"
            className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-3 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Visual Style Section */}
      <div className="pt-8 border-t border-[#2A2438]">
        <h3 className="text-xl font-semibold text-[#FFF1E7] mb-2">Visual Style</h3>
        <p className="text-[#FFF1E7]/60 text-sm mb-6">
          Define the look and feel of your social media posts with consistent colors, fonts, and image style.
        </p>

        {/* Brand Colors */}
        <div className="mb-6">
          <label className="text-[#FFF1E7]/80 font-medium block mb-3">
            Brand Colors ({(visualStyle.colors || []).length}/6)
          </label>
          <div className="flex flex-wrap gap-3 mb-3">
            {(visualStyle.colors || []).map((color, index) => (
              <div key={index} className="relative group">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-[#3A3448] cursor-pointer"
                  style={{ backgroundColor: color }}
                  title={color}
                />
                <button
                  onClick={() => removeColor(color)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <span className="text-[#FFF1E7]/60 text-xs mt-1 block text-center font-mono">
                  {color.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="h-10 w-16 rounded cursor-pointer"
            />
            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              placeholder="#000000"
              className="flex-1 bg-[#2A2438] text-[#FFF1E7] px-4 py-2 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-sm font-mono"
            />
            <button
              onClick={addColor}
              disabled={(visualStyle.colors || []).length >= 6}
              className="bg-[#EF8E81] hover:bg-[#E67A6E] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add Color
            </button>
          </div>
        </div>

        {/* Fonts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-[#FFF1E7]/80 font-medium block mb-2">
              Heading Font
            </label>
            <input
              type="text"
              value={visualStyle.fonts?.heading || ''}
              onChange={(e) => onVisualStyleChange({
                ...visualStyle,
                fonts: { ...visualStyle.fonts, heading: e.target.value }
              })}
              placeholder="e.g., Montserrat, Arial Black"
              className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-2 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-sm"
            />
          </div>
          <div>
            <label className="text-[#FFF1E7]/80 font-medium block mb-2">
              Body Font
            </label>
            <input
              type="text"
              value={visualStyle.fonts?.body || ''}
              onChange={(e) => onVisualStyleChange({
                ...visualStyle,
                fonts: { ...visualStyle.fonts, body: e.target.value }
              })}
              placeholder="e.g., Open Sans, Helvetica"
              className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-2 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-sm"
            />
          </div>
        </div>

        {/* Image Style */}
        <div className="mb-6">
          <label className="text-[#FFF1E7]/80 font-medium block mb-2">
            Image Style & Photography Notes
          </label>
          <textarea
            value={visualStyle.imageStyle || ''}
            onChange={(e) => onVisualStyleChange({ ...visualStyle, imageStyle: e.target.value })}
            placeholder="Describe your visual aesthetic (e.g., 'Bright, well-lit photos with natural lighting', 'Earthy, muted tones', 'Bold graphics with minimal text', etc.)"
            className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-3 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] resize-none"
            rows={3}
          />
        </div>

        {/* Design Notes */}
        <div>
          <label className="text-[#FFF1E7]/80 font-medium block mb-2">
            Design Guidelines & Notes
          </label>
          <textarea
            value={visualStyle.designNotes || ''}
            onChange={(e) => onVisualStyleChange({ ...visualStyle, designNotes: e.target.value })}
            placeholder="Add any specific design rules or notes (e.g., 'Always include logo in bottom right', 'No more than 2 fonts per graphic', 'Maintain 60-30-10 color rule', etc.)"
            className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-3 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

