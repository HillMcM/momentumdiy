import UniversalTrackTemplate from '../components/UniversalTrackTemplate';
import { getTrackConfig } from '../config/trackConfigs';
import type { MarketingGoal, Project, Task } from '../types';

interface SocialMediaStrategyTrackProps {
  marketingGoals: MarketingGoal[];
  onMarketingGoalsChange: (goals: MarketingGoal[]) => void;
  onProjectsChange: (projects: Project[]) => void;
  projects: Project[];
  tasks: Task[];
}

export default function SocialMediaStrategyTrack({ 
  marketingGoals, 
  onMarketingGoalsChange, 
  onProjectsChange, 
  projects,
  tasks 
}: SocialMediaStrategyTrackProps) {
  const trackConfig = getTrackConfig('social-media-strategy');
  
  if (!trackConfig) {
    return <div>Track configuration not found</div>;
  }

  return (
    <UniversalTrackTemplate
      marketingGoals={marketingGoals}
      onMarketingGoalsChange={onMarketingGoalsChange}
      onProjectsChange={onProjectsChange}
      projects={projects}
      tasks={tasks}
      trackSlug="social-media-strategy"
      trackConfig={trackConfig}
    />
  );
}