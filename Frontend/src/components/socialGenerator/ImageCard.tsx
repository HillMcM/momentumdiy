
import React from 'react';
import type { GeneratedImage } from '../../types/socialGenerator';
import { Spinner } from './Spinner';

interface ImageCardProps {
  image: GeneratedImage;
  onSelect: (image: GeneratedImage) => void;
  isRefining: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onSelect, isRefining }) => {
  return (
    <div className="group relative overflow-hidden rounded-lg shadow-lg aspect-square">
      <img
        src={`data:image/png;base64,${image.imageData}`}
        alt="Generated social media graphic"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <div className="w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={() => onSelect(image)}
            disabled={isRefining}
            className="w-full flex justify-center items-center gap-2 text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors disabled:bg-indigo-900/50 disabled:cursor-not-allowed"
          >
            {isRefining ? <><Spinner /> Refining...</> : 'Select & Refine Style'}
          </button>
        </div>
      </div>
    </div>
  );
};
