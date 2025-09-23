import type { MarketingModule } from '../../types';
import { getContentRendererByTitle } from '../content-renderers';
import { useContext } from 'react';
import { MarketingTrackContext } from '../../contexts/MarketingTrackContext';
import { renderMarketingContent } from '../../utils/contentRenderer';

interface LessonCardProps {
  module: MarketingModule;
}

export default function LessonCard({ module }: LessonCardProps) {
  const context = useContext(MarketingTrackContext);
  const activeGoal = context?.activeGoal;
  
  // Get the appropriate content renderer based on the track
  const renderer = activeGoal ? getContentRendererByTitle(activeGoal.title) : null;
  
  if (!renderer) {
    // Default to enhanced markdown rendering if no renderer found
    return (
      <div className="text-gray-300">
        {renderMarketingContent(module.content || '')}
      </div>
    );
  }

  // Use the track-specific renderer
  return (
    <div>
      {renderer.renderWeeklyLesson(module)}
    </div>
  );
}
