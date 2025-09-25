
import React from 'react';
import type { GeneratedImage } from '../../types/socialGenerator';
import { ImageCard } from './ImageCard';
import { Spinner } from './Spinner';

interface ImageGridProps {
  images: GeneratedImage[];
  onSelect: (image: GeneratedImage) => void;
  isLoading: boolean;
  isRefining: boolean;
}

const LoadingSkeleton: React.FC = () => (
  <div className="bg-gray-800 rounded-lg animate-pulse aspect-square"></div>
);

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onSelect, isLoading, isRefining }) => {
  return (
    <div className="flex-grow bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 min-h-[400px]">
      {isLoading && images.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} />)}
          </div>
      )}
      {!isLoading && images.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <p className="text-lg">Your generated graphics will appear here.</p>
            <p className="text-sm">Customize your brand settings and click "Generate Graphics" to start.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading && images.length > 0 && [...Array(4)].map((_, i) => <LoadingSkeleton key={`loading-${i}`} />)}
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onSelect={onSelect}
            isRefining={isRefining}
          />
        ))}
      </div>
    </div>
  );
};
