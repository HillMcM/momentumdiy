import type { MarketingModule } from '../../types';
import { renderMarketingContent } from '../../utils/contentRenderer';

interface LessonCardProps {
  module: MarketingModule;
}

export default function LessonCard({ module }: LessonCardProps) {
  // All content is now rendered using the universal markdown renderer
  // No need for track-specific renderers anymore
  return (
    <div className="text-gray-300">
      {renderMarketingContent(module.content || '')}
    </div>
  );
}
