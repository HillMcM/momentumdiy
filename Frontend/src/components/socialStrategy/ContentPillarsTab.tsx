import * as React from 'react';
import { useState } from 'react';
import type { ContentPillar } from '../../types';

interface ContentPillarsTabProps {
  pillars: ContentPillar[];
  onChange: (pillars: ContentPillar[]) => void;
}

const PRESET_COLORS = [
  '#EF8E81', // Coral
  '#10b981', // Green
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
];

export default function ContentPillarsTab({ pillars, onChange }: ContentPillarsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addPillar = () => {
    if (pillars.length >= 4) return;
    
    const newPillar: ContentPillar = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      colorTag: PRESET_COLORS[pillars.length % PRESET_COLORS.length],
      exampleIdeas: ['']
    };
    
    onChange([...pillars, newPillar]);
    setEditingId(newPillar.id);
  };

  const updatePillar = (id: string, updates: Partial<ContentPillar>) => {
    onChange(pillars.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePillar = (id: string) => {
    onChange(pillars.filter(p => p.id !== id));
  };

  const addExampleIdea = (pillarId: string) => {
    const pillar = pillars.find(p => p.id === pillarId);
    if (!pillar) return;
    
    updatePillar(pillarId, {
      exampleIdeas: [...pillar.exampleIdeas, '']
    });
  };

  const updateExampleIdea = (pillarId: string, index: number, value: string) => {
    const pillar = pillars.find(p => p.id === pillarId);
    if (!pillar) return;
    
    const newIdeas = [...pillar.exampleIdeas];
    newIdeas[index] = value;
    updatePillar(pillarId, { exampleIdeas: newIdeas });
  };

  const removeExampleIdea = (pillarId: string, index: number) => {
    const pillar = pillars.find(p => p.id === pillarId);
    if (!pillar || pillar.exampleIdeas.length <= 1) return;
    
    updatePillar(pillarId, {
      exampleIdeas: pillar.exampleIdeas.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#FFF1E7] mb-2">Content Pillars</h3>
        <p className="text-[#FFF1E7]/60 text-sm mb-4">
          Define 3-4 core themes or topics you'll post about regularly. These pillars will guide your content creation and keep your social media focused.
        </p>
      </div>

      <div className="space-y-4">
        {pillars.map((pillar, index) => (
          <div
            key={pillar.id}
            className="bg-[#1A1625]/50 rounded-lg p-6 border border-[#2A2438]"
            style={{ borderLeftWidth: '4px', borderLeftColor: pillar.colorTag }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 flex-1">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: pillar.colorTag }}
                >
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={pillar.name}
                  onChange={(e) => updatePillar(pillar.id, { name: e.target.value })}
                  placeholder="Pillar Name (e.g., Product Tips & How-To's)"
                  className="flex-1 bg-[#2A2438] text-[#FFF1E7] px-4 py-2 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-lg font-medium"
                />
              </div>
              <button
                onClick={() => deletePillar(pillar.id)}
                className="ml-3 text-[#FFF1E7]/40 hover:text-red-400 transition-colors"
                title="Delete pillar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <textarea
              value={pillar.description}
              onChange={(e) => updatePillar(pillar.id, { description: e.target.value })}
              placeholder="Describe what this pillar covers..."
              className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-3 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] mb-4 resize-none"
              rows={2}
            />

            <div className="space-y-2">
              <label className="text-[#FFF1E7]/80 text-sm font-medium flex items-center justify-between">
                <span>Example Post Ideas:</span>
                <button
                  onClick={() => addExampleIdea(pillar.id)}
                  className="text-[#EF8E81] hover:text-[#EF8E81]/80 text-xs flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Idea
                </button>
              </label>
              {pillar.exampleIdeas.map((idea, ideaIndex) => (
                <div key={ideaIndex} className="flex items-center space-x-2">
                  <span className="text-[#FFF1E7]/40 text-sm">•</span>
                  <input
                    type="text"
                    value={idea}
                    onChange={(e) => updateExampleIdea(pillar.id, ideaIndex, e.target.value)}
                    placeholder="Post idea example"
                    className="flex-1 bg-[#2A2438]/50 text-[#FFF1E7] px-3 py-2 rounded border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-sm"
                  />
                  {pillar.exampleIdeas.length > 1 && (
                    <button
                      onClick={() => removeExampleIdea(pillar.id, ideaIndex)}
                      className="text-[#FFF1E7]/30 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-[#FFF1E7]/80 text-sm font-medium block mb-2">Color Tag:</label>
              <div className="flex space-x-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => updatePillar(pillar.id, { colorTag: color })}
                    className={`w-8 h-8 rounded-full transition-all ${
                      pillar.colorTag === color
                        ? 'ring-2 ring-[#FFF1E7] ring-offset-2 ring-offset-[#1A1625]'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {pillars.length < 4 && (
        <button
          onClick={addPillar}
          className="w-full bg-[#2A2438] hover:bg-[#3A3448] text-[#FFF1E7] py-4 rounded-lg border-2 border-dashed border-[#3A3448] hover:border-[#EF8E81] transition-all flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Content Pillar ({pillars.length}/4)
        </button>
      )}

      {pillars.length === 0 && (
        <div className="bg-[#2A2438]/30 border border-[#3A3448] rounded-lg p-8 text-center">
          <div className="text-[#FFF1E7]/40 mb-4">
            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-[#FFF1E7] text-lg font-medium mb-2">No Content Pillars Yet</h4>
          <p className="text-[#FFF1E7]/60 text-sm mb-4">
            Start by defining your first content pillar. Aim for 3-4 core themes.
          </p>
        </div>
      )}
    </div>
  );
}

