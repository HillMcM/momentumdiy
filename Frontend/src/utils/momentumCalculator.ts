/**
 * Momentum Score Calculator
 * 
 * Calculates a sophisticated "Momentum Score" (0-100) based on:
 * - Task completion rate (50% weight)
 * - Completion speed vs schedule (25% weight)
 * - Weekly consistency/streak (25% weight)
 */

export interface MomentumFactors {
  tasksCompleted: number;
  totalTasks: number;
  completionSpeed: number; // days ahead (+) or behind (-) schedule
  currentStreak: number; // consecutive weeks with activity
  weeklyConsistency: number; // variance in tasks per week (lower is better)
}

export interface MomentumBadge {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'needs-attention';
  color: string;
  message: string;
  emoji: string;
}

/**
 * Calculate the weighted momentum score
 */
export function calculateMomentumScore(factors: MomentumFactors): number {
  // Weighted algorithm:
  const taskWeight = 0.50; // 50% - completion ratio
  const speedWeight = 0.25; // 25% - ahead of/behind schedule
  const streakWeight = 0.25; // 25% - consistency

  // Task completion score (0-100)
  const taskScore = factors.totalTasks > 0 
    ? (factors.tasksCompleted / factors.totalTasks) * 100 
    : 0;
  
  // Speed score: positive if ahead, negative if behind
  // Each day ahead/behind is worth 10 points, capped at 0-100
  const speedScore = Math.max(0, Math.min(100, 
    50 + (factors.completionSpeed * 10)
  ));
  
  // Streak score: each week of activity is worth 10 points, caps at 100
  const streakScore = Math.min(100, factors.currentStreak * 10);
  
  // Calculate weighted final score
  const finalScore = Math.round(
    (taskScore * taskWeight) + 
    (speedScore * speedWeight) + 
    (streakScore * streakWeight)
  );

  return Math.max(0, Math.min(100, finalScore));
}

/**
 * Get badge information based on momentum score
 */
export function getMomentumBadge(score: number): MomentumBadge {
  if (score >= 91) {
    return {
      score,
      level: 'excellent',
      color: '#10B981', // Green
      message: 'Outstanding momentum! You\'re crushing it! 🔥',
      emoji: '🚀'
    };
  } else if (score >= 71) {
    return {
      score,
      level: 'good',
      color: '#3B82F6', // Blue
      message: 'Great progress! Keep up the strong work!',
      emoji: '⭐'
    };
  } else if (score >= 41) {
    return {
      score,
      level: 'fair',
      color: '#F59E0B', // Yellow/Orange
      message: 'Steady progress. A little more effort will boost your momentum!',
      emoji: '💪'
    };
  } else {
    return {
      score,
      level: 'needs-attention',
      color: '#EF4444', // Red
      message: 'Time to kickstart your momentum! Small steps make big changes.',
      emoji: '🎯'
    };
  }
}

/**
 * Calculate current streak from weekly notes or activity log
 */
export function calculateStreak(weeklyActivities: { week: number; hasActivity: boolean }[]): number {
  if (!weeklyActivities || weeklyActivities.length === 0) return 0;

  // Sort by week descending
  const sorted = [...weeklyActivities].sort((a, b) => b.week - a.week);
  
  let streak = 0;
  let expectedWeek = sorted[0].week;
  
  for (const activity of sorted) {
    if (activity.week === expectedWeek && activity.hasActivity) {
      streak++;
      expectedWeek--;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Calculate completion speed (days ahead or behind schedule)
 * Positive = ahead, Negative = behind
 */
export function calculateCompletionSpeed(
  currentWeek: number,
  startDate: string,
  expectedWeekBasedOnDate: number
): number {
  // If user is further along than calendar weeks, they're ahead
  const weeksDifference = currentWeek - expectedWeekBasedOnDate;
  
  // Convert weeks to days (7 days per week)
  return weeksDifference * 7;
}

/**
 * Calculate weekly consistency (lower variance = better)
 * Returns a score 0-100 where 100 is perfect consistency
 */
export function calculateWeeklyConsistency(tasksPerWeek: number[]): number {
  if (tasksPerWeek.length === 0) return 0;
  if (tasksPerWeek.length === 1) return 100; // Perfect if only one week

  const mean = tasksPerWeek.reduce((sum, val) => sum + val, 0) / tasksPerWeek.length;
  const variance = tasksPerWeek.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / tasksPerWeek.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower standard deviation = higher consistency
  // Normalize to 0-100 scale (assume max reasonable stdDev is 5 tasks)
  const consistencyScore = Math.max(0, 100 - (stdDev * 20));
  
  return Math.round(consistencyScore);
}

/**
 * Get momentum factors from user's track progress
 */
export function getMomentumFactorsFromTrackData(trackData: {
  tasksCompleted: number;
  totalTasks: number;
  currentWeek: number;
  startDate: string;
  weeklyNotes: any[];
}): MomentumFactors {
  // Calculate expected week based on start date
  const start = new Date(trackData.startDate);
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const expectedWeek = Math.floor(daysSinceStart / 7) + 1;
  
  // Calculate completion speed
  const completionSpeed = calculateCompletionSpeed(
    trackData.currentWeek,
    trackData.startDate,
    expectedWeek
  );
  
  // Calculate streak from weekly notes (presence of note = activity)
  const weeklyActivities = trackData.weeklyNotes.map((note: any) => ({
    week: note.week,
    hasActivity: true
  }));
  const currentStreak = calculateStreak(weeklyActivities);
  
  // For simplicity, assume consistent progress (can be enhanced with actual data)
  const weeklyConsistency = 85; // Default to "good" consistency
  
  return {
    tasksCompleted: trackData.tasksCompleted,
    totalTasks: trackData.totalTasks,
    completionSpeed,
    currentStreak,
    weeklyConsistency
  };
}

