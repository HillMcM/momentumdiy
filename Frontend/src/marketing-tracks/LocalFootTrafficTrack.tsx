import UniversalTrackTemplate from '../components/UniversalTrackTemplate';
import { getTrackConfig } from '../config/trackConfigs';
import type { MarketingGoal, Project, Task } from '../types';

interface LocalFootTrafficTrackProps {
  marketingGoals: MarketingGoal[];
  onMarketingGoalsChange: (goals: MarketingGoal[]) => void;
  onProjectsChange: (projects: Project[]) => void;
  projects: Project[];
  tasks: Task[];
}

export default function LocalFootTrafficTrack({ 
  marketingGoals, 
  onMarketingGoalsChange, 
  onProjectsChange, 
  projects,
  tasks 
}: LocalFootTrafficTrackProps) {
  const trackConfig = getTrackConfig('local-foot-traffic');
  
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
      trackSlug="local-foot-traffic"
      trackConfig={trackConfig}
    />
  );
}