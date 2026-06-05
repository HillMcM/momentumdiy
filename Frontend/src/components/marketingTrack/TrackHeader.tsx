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

      {/* Intro paragraph with Example Outcomes */}
      {(() => {
        // Extract example outcomes from description
        const extractOutcomes = (description: string): string[] => {
          const outcomes: string[] = [];
          
          // Pattern 1: "Example outcomes:" followed by bullet points or comma-separated list
          // Try to match with newline first, then try inline (same line)
          let exampleOutcomesMatch = description.match(/(?:Example outcomes?):\s*([\s\S]*?)(?=\n\n[A-Z]|$)/i);
          if (!exampleOutcomesMatch) {
            // Try inline format (same line, ends with period or end of string)
            exampleOutcomesMatch = description.match(/(?:Example outcomes?):\s*([^.]*(?:\.[^.]*)*?)(?=\s+[A-Z]|$)/i);
          }
          
          if (exampleOutcomesMatch) {
            const outcomesText = exampleOutcomesMatch[1].trim();
            
            // First try to extract bullet points
            const bulletMatches = outcomesText.match(/^\s*[-*•]\s*(.+)$/gm);
            if (bulletMatches && bulletMatches.length > 0) {
              const bullets = bulletMatches.map(m => m.replace(/^\s*[-*•]\s*/, '').trim()).filter(s => s.length > 0);
              outcomes.push(...bullets);
            } else {
              // If no bullets, try comma-separated format
              const commaSeparated = outcomesText.split(',').map(s => s.trim()).filter(s => s.length > 0);
              if (commaSeparated.length > 0) {
                outcomes.push(...commaSeparated);
              }
            }
          }
          
          // Pattern 2: Look for bullet-like patterns anywhere in description (fallback)
          if (outcomes.length === 0) {
            const bulletMatches = description.match(/(?:^|\n)[\s]*[-*•]\s*([^\n]+)/g);
            if (bulletMatches && bulletMatches.length > 0) {
              const bullets = bulletMatches.map(m => m.replace(/^[\s]*[-*•]\s*/, '').trim()).filter(s => s.length > 0);
              if (bullets.length > 0) {
                outcomes.push(...bullets);
              }
            }
          }
          
          return outcomes.slice(0, 5); // Limit to 5 outcomes
        };
        
        const outcomes = extractOutcomes(introText);
        
        // Remove the "Example outcomes:" section and all bullet points from description
        let descriptionWithoutOutcomes = introText
          .replace(/(?:Example outcomes?):\s*[\s\S]*?(?=\n\n[A-Z]|$)/i, '')
          .replace(/(?:^|\n)[\s]*[-*•]\s*[^\n]+/g, '')
          .replace(/Example outcomes?:\s*[^.]*(?:\.[^.]*)*/gi, '') // Also remove inline comma-separated outcomes
          .trim();
        
        // Clean up any double newlines or extra whitespace
        descriptionWithoutOutcomes = descriptionWithoutOutcomes.replace(/\n{3,}/g, '\n\n').trim();
        
        return outcomes.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
            <p className="text-gray-300 text-lg leading-relaxed flex-1">
              {descriptionWithoutOutcomes || introText}
            </p>
            <div className="lg:w-80 flex-shrink-0">
              <h3 className="text-xl font-bold text-white mb-4">Example Outcomes</h3>
              <ul className="space-y-3">
                {outcomes.map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <span className="text-[#EF8E81] mt-1 flex-shrink-0">→</span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            {introText}
          </p>
        );
      })()}

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
