import { useNotifications } from '../contexts/NotificationContext';

export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();

  const showSuccess = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      type: 'success',
      title,
      message,
      action,
    });
  };

  const showError = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      type: 'error',
      title,
      message,
      persistent: true, // Errors should persist until manually dismissed
      action,
    });
  };

  const showWarning = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      type: 'warning',
      title,
      message,
      action,
    });
  };

  const showInfo = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      type: 'info',
      title,
      message,
      action,
    });
  };

  const showTaskReminder = (taskName: string, onClick?: () => void) => {
    addNotification({
      type: 'info',
      title: '💪 Keep Going!',
      message: `You're doing great! Ready to tackle: ${taskName}?`,
      persistent: true,
      action: onClick ? {
        label: 'Let\'s Do This!',
        onClick,
      } : undefined,
    });
  };

  const showProgressUpdate = (completedTasks: number, totalTasks: number, onClick?: () => void) => {
    const percentage = Math.round((completedTasks / totalTasks) * 100);
    let encouragement = '';
    if (percentage >= 100) {
      encouragement = '🎉 Amazing! You\'ve completed everything! You\'re unstoppable!';
    } else if (percentage >= 75) {
      encouragement = '🔥 You\'re on fire! Almost there - keep pushing!';
    } else if (percentage >= 50) {
      encouragement = '💪 You\'re halfway there! Great momentum!';
    } else if (percentage >= 25) {
      encouragement = '🌟 Great start! You\'re building momentum!';
    } else {
      encouragement = '🚀 Every step counts! You\'ve got this!';
    }
    
    addNotification({
      type: 'success',
      title: '🎯 Progress Update',
      message: `${encouragement} You've completed ${completedTasks} of ${totalTasks} tasks (${percentage}%)`,
      action: onClick ? {
        label: 'View Progress',
        onClick,
      } : undefined,
    });
  };

  const showSubscriptionUpdate = (message: string, onClick?: () => void) => {
    addNotification({
      type: 'success',
      title: 'Subscription Updated',
      message,
      action: onClick ? {
        label: 'View Details',
        onClick,
      } : undefined,
    });
  };

  const showWelcome = (userName: string, onClick?: () => void) => {
    addNotification({
      type: 'success',
      title: 'Welcome to MomentumDIY!',
      message: `Hi ${userName}! Let's get started with your marketing journey.`,
      action: onClick ? {
        label: 'Get Started',
        onClick,
      } : undefined,
    });
  };

  const showTaskCompleted = (taskName: string, onClick?: () => void) => {
    addNotification({
      type: 'success',
      title: '🎉 Task Completed!',
      message: `Fantastic work on completing "${taskName}"! You're making real progress!`,
      action: onClick ? {
        label: 'Keep Going!',
        onClick,
      } : undefined,
    });
  };

  const showModuleCompleted = (moduleName: string, weekNumber: number, onClick?: () => void) => {
    addNotification({
      type: 'success',
      title: '🏆 Week Complete!',
      message: `Incredible! You've finished Week ${weekNumber}: ${moduleName}. Your dedication is paying off!`,
      action: onClick ? {
        label: 'View Next Week',
        onClick,
      } : undefined,
    });
  };

  const showMarketingTrackProgress = (trackName: string, progress: number, improvement?: number, onClick?: () => void) => {
    let message = `Your ${trackName} marketing track is ${progress}% complete!`;
    if (improvement && improvement > 0) {
      message += ` Your local foot traffic has improved by ${improvement}% since you began! Congratulations! Keep going!`;
    } else {
      message += ` You're building momentum and making a real impact!`;
    }
    
    addNotification({
      type: 'success',
      title: '📈 Track Progress',
      message,
      action: onClick ? {
        label: 'View Details',
        onClick,
      } : undefined,
    });
  };

  const showStreakAchievement = (days: number, onClick?: () => void) => {
    addNotification({
      type: 'success',
      title: '🔥 Streak Achievement!',
      message: `Wow! You've been consistent for ${days} days in a row! Your commitment is inspiring!`,
      action: onClick ? {
        label: 'Keep It Up!',
        onClick,
      } : undefined,
    });
  };

  const showMilestoneReached = (milestone: string, onClick?: () => void) => {
    addNotification({
      type: 'success',
      title: '🎯 Milestone Reached!',
      message: `Congratulations! You've reached a major milestone: ${milestone}. You're doing amazing work!`,
      action: onClick ? {
        label: 'Celebrate!',
        onClick,
      } : undefined,
    });
  };

  const showWeekUnlocked = (weekNumber: number, onClick?: () => void) => {
    addNotification({
      type: 'success',
      title: '🔓 New Week Unlocked!',
      message: `Week ${weekNumber} is now available! Ready to continue your marketing journey?`,
      action: onClick ? {
        label: 'View Week',
        onClick,
      } : undefined,
    });
  };

  const showTrackCompleted = (trackName: string, onClick?: () => void) => {
    addNotification({
      type: 'success',
      title: '🎉 Track Completed!',
      message: `Amazing! You've completed the ${trackName} track! Your dedication has paid off. Ready to choose your next journey?`,
      persistent: true,
      action: onClick ? {
        label: 'Choose Next Track',
        onClick,
      } : undefined,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showTaskReminder,
    showProgressUpdate,
    showSubscriptionUpdate,
    showWelcome,
    showTaskCompleted,
    showModuleCompleted,
    showMarketingTrackProgress,
    showStreakAchievement,
    showMilestoneReached,
    showWeekUnlocked,
    showTrackCompleted,
  };
};
