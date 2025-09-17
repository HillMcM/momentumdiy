import type { MarketingModule } from '../../types';
import { getContentRendererByTitle } from '../content-renderers';
import { useContext } from 'react';
import { MarketingTrackContext } from '../../contexts/MarketingTrackContext';

interface LessonCardProps {
  module: MarketingModule;
}

export default function LessonCard({ module }: LessonCardProps) {
  const context = useContext(MarketingTrackContext);
  const activeGoal = context?.activeGoal;
  
  // Get the appropriate content renderer based on the track
  const renderer = activeGoal ? getContentRendererByTitle(activeGoal.title) : null;
  
  if (!renderer) {
    // Fallback to original rendering if no renderer found
    return (
      <div className="prose prose-invert max-w-none text-gray-300">
        <p>Content renderer not found for this track type.</p>
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
