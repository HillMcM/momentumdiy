import type { MarketingGoal } from '../../types';
import Pill from './Pill';
import ProgressBar from './ProgressBar';
import { computeNextUnlockLabel } from '../../utils/date';

interface TrackHeaderProps {
  goal: MarketingGoal;
}

export default function TrackHeader({ goal }: TrackHeaderProps) {
  const introText = goal.description || `Build and execute a comprehensive ${goal.industry} marketing strategy over ${goal.duration} weeks.`;

  return (
    <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8 mb-8">
      {/* Header with title and pills */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{goal.title}</h1>
          <p className="text-gray-400">Active Track</p>
        </div>

        <div className="flex gap-3">
          {goal.isActive && (
            <Pill variant="success">
              Active • Week {goal.currentWeek} of {goal.duration}
            </Pill>
          )}
          <Pill variant="accent">
            {computeNextUnlockLabel(goal)}
          </Pill>
        </div>
      </div>

      {/* Intro paragraph */}
      <p className="text-gray-300 text-lg mb-8 leading-relaxed">
        {introText}
      </p>

      {/* Overall Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Overall Progress</span>
          <span className="text-sm font-medium text-[#EF8E81]">{goal.progress}%</span>
        </div>
        <ProgressBar progress={goal.progress} />
      </div>

      {/* Phase block (cosmetic) */}
      <div className="mt-8 pt-6 border-t border-[#2A243E]">
        <h3 className="text-xl font-semibold text-white mb-3">Phase 1: Foundation & Strategy</h3>
        <p className="text-gray-400 leading-relaxed">
          Build a strong foundation with strategic planning, content creation, and audience engagement.
          This phase focuses on establishing your brand presence and creating sustainable marketing habits.
        </p>
      </div>
    </div>
  );
}
