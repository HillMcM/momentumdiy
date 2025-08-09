import type { Task, Project, CalendarEvent } from './types';

export function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  const totalWeight = tasks.reduce((sum, task) => {
    switch (task.status) {
      case 'completed':
        return sum + 100;
      case 'in-progress':
        return sum + 50;
      default:
        return sum;
    }
  }, 0);

  return Math.round(totalWeight / tasks.length);
}

export function shouldMarkAsCompleted(tasks: Task[]): boolean {
  return tasks.length > 0 && tasks.every(task => task.status === 'completed');
}

export function getCalendarEvents(tasks: Task[], projects: Project[], customEvents: CalendarEvent[]): CalendarEvent[] {
  const taskEvents: CalendarEvent[] = tasks.filter(t => t.deadline).map(t => ({
    id: `task-${t.id}`,
    title: t.title,
    description: t.description,
    start: t.deadline!,
    type: 'task',
    refId: t.id,
  }));
  const projectEvents: CalendarEvent[] = projects.filter(p => p.deadline).map(p => ({
    id: `project-${p.id}`,
    title: p.name,
    description: p.description,
    start: p.deadline!,
    type: 'project',
    refId: p.id,
  }));
  return [...taskEvents, ...projectEvents, ...customEvents];
} 