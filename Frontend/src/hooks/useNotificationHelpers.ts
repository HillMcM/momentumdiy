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
      type: 'warning',
      title: 'Task Reminder',
      message: `Don't forget to complete: ${taskName}`,
      persistent: true,
      action: onClick ? {
        label: 'View Task',
        onClick,
      } : undefined,
    });
  };

  const showProgressUpdate = (completedTasks: number, totalTasks: number, onClick?: () => void) => {
    const percentage = Math.round((completedTasks / totalTasks) * 100);
    addNotification({
      type: 'info',
      title: 'Progress Update',
      message: `You've completed ${completedTasks} of ${totalTasks} tasks (${percentage}%)`,
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

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showTaskReminder,
    showProgressUpdate,
    showSubscriptionUpdate,
    showWelcome,
  };
};
