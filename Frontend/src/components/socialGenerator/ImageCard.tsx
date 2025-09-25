
import React from 'react';
import type { GeneratedImage } from '../../types/socialGenerator';
import { Spinner } from './Spinner';

interface ImageCardProps {
  image: GeneratedImage;
  onSelect: (image: GeneratedImage) => void;
  isRefining: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onSelect, isRefining }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${image.imageData}`;
    link.download = `social-media-graphic-${image.id.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group relative overflow-hidden rounded-lg shadow-lg aspect-square">
      <img
        src={`data:image/png;base64,${image.imageData}`}
        alt="Generated social media graphic"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <div className="w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 space-y-2">
          <button
            onClick={() => onSelect(image)}
            disabled={isRefining}
            className="w-full flex justify-center items-center gap-2 text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors disabled:bg-indigo-900/50 disabled:cursor-not-allowed"
          >
            {isRefining ? <><Spinner /> Refining...</> : 'Select & Refine Style'}
          </button>
          <button
            onClick={handleDownload}
            className="w-full flex justify-center items-center gap-2 text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  );
};
