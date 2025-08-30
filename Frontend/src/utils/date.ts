import type { MarketingGoal } from '../types';

/**
 * Compute the next unlock label for a marketing goal
 */
export function computeNextUnlockLabel(goal: MarketingGoal): string {
  if (goal.startDate) {
    const startDate = new Date(goal.startDate);
    const now = new Date();

    // Calculate when the next week should unlock
    const nextUnlockDate = new Date(startDate);
    nextUnlockDate.setDate(startDate.getDate() + (goal.currentWeek * 7));

    if (now >= nextUnlockDate) {
      return 'unlocked';
    } else {
      const diffTime = nextUnlockDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `Next week unlocks in ${diffDays} days`;
    }
  } else {
    return 'Next week unlocks soon';
  }
}

/**
 * Count completed and total tasks in a module
 */
export function countTasks(module: { tasks: { isCompleted: boolean }[] }) {
  const total = module.tasks.length;
  const done = module.tasks.filter(task => task.isCompleted).length;
  return { done, total };
}

/**
 * Calculate progress percentage based on completed tasks in current module
 */
export function calculateModuleProgress(module: { tasks: { isCompleted: boolean }[] }): number {
  const { done, total } = countTasks(module);
  return total > 0 ? Math.round((done / total) * 100) : 0;
}
