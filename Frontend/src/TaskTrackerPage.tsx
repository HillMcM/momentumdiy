import type { Task, Project } from './types';
import TaskTrackerWidget from './TaskTrackerWidget';

interface TaskTrackerPageProps {
  projects: Project[];
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onProjectsChange: (projects: Project[]) => void;
}

export default function TaskTrackerPage({ projects, tasks, onTasksChange, onProjectsChange }: TaskTrackerPageProps) {
  return (
    <div className="widget" style={{ 
      padding: '2rem',
      minHeight: '100vh',
      color: '#FFF1E7'
    }}>
      <TaskTrackerWidget 
        projects={projects}
        tasks={tasks}
        onTasksChange={onTasksChange}
        onProjectsChange={onProjectsChange}
      />
    </div>
  );
}

// TypeScript module declaration for import
export {}; 