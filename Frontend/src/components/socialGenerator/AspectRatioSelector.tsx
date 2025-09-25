
import React from 'react';
import type { AspectRatio } from '../../types/socialGenerator';
import { AspectRatios } from '../../constants/socialGenerator';

interface AspectRatioSelectorProps {
  selected: AspectRatio;
  onSelect: (aspectRatio: AspectRatio) => void;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="bg-gray-800/50 p-2 rounded-xl border border-gray-700/50">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {AspectRatios.map(ratio => (
          <button
            key={ratio.value}
            onClick={() => onSelect(ratio)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
              ${selected.value === ratio.value 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            {ratio.name} <span className="text-xs opacity-70">({ratio.label})</span>
          </button>
        ))}
      </div>
    </div>
  );
};
