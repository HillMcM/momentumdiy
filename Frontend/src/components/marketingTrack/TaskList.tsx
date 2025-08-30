import type { MarketingTask } from '../../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: MarketingTask[];
  onTaskToggle: (taskId: string, isCompleted: boolean) => void;
}

export default function TaskList({ tasks, onTaskToggle }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-gray-400 text-center py-8">No tasks available for this week.</p>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onTaskToggle}
        />
      ))}
    </div>
  );
}
