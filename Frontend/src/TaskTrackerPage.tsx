import type { Task, Project, MarketingGoal } from './types';
import TaskTrackerWidget from './TaskTrackerWidget';

interface TaskTrackerPageProps {
  projects: Project[];
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onProjectsChange: (projects: Project[]) => void;
  marketingGoals: MarketingGoal[];
}

export default function TaskTrackerPage({ projects, tasks, onTasksChange, onProjectsChange, marketingGoals }: TaskTrackerPageProps) {
  const activeGoal = marketingGoals.find(g => g.isActive);
  const visibleTasks = activeGoal 
    ? tasks.filter(t => t.marketingTrack && t.marketingTrack.goalId === activeGoal.id)
    : tasks;

  const handleSubsetTasksChange = (updatedVisible: Task[]) => {
    if (!activeGoal) {
      onTasksChange(updatedVisible);
      return;
    }
    const others = tasks.filter(t => !(t.marketingTrack && t.marketingTrack.goalId === activeGoal.id));
    onTasksChange([...others, ...updatedVisible]);
  };

  return (
    <div className="widget" style={{ 
      padding: '2rem',
      minHeight: '100vh',
      color: '#FFF1E7'
    }}>
      <TaskTrackerWidget 
        projects={projects}
        tasks={visibleTasks}
        onTasksChange={handleSubsetTasksChange}
        onProjectsChange={onProjectsChange}
      />
    </div>
  );
}

// TypeScript module declaration for import
export {}; 