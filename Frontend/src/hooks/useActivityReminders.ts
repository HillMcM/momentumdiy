import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMarketing } from '../contexts/MarketingContext';
import { useNotificationHelpers } from './useNotificationHelpers';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { logger } from '../utils/logger';

/**
 * Hook to check user activity and show encouraging notifications
 * when users haven't completed tasks in a while
 */
export function useActivityReminders() {
  const { user } = useAuth();
  const { activeGoal } = useMarketing();
  const { showTaskReminder } = useNotificationHelpers();
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const lastCheckRef = useRef<number>(Date.now());
  const reminderShownRef = useRef<boolean>(false);
  const lastNotificationTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!user || !activeGoal) {
      return;
    }

    // Check activity every 5 minutes
    const checkInterval = setInterval(() => {
      const now = Date.now();
      const lastCheck = lastCheckRef.current;
      const timeSinceCheck = now - lastCheck;

      // Only check if at least 5 minutes have passed since last check
      if (timeSinceCheck < 5 * 60 * 1000) {
        return;
      }

      // Get all tasks from active goal
      const allTasks = activeGoal.modules.flatMap(module => module.tasks || []);
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(task => task.isCompleted).length;
      const incompleteTasks = allTasks.filter(task => !task.isCompleted);

      // Only show reminder if:
      // 1. User has incomplete tasks
      // 2. User has completed less than 50% of tasks
      // 3. We haven't shown a reminder in the last 24 hours
      // 4. No similar notification already exists
      // 5. At least 1 minute has passed since last notification
      const hasSimilarNotification = notifications.some(n => 
        n.title === '💪 Keep Going!' && 
        n.type === 'info' &&
        Date.now() - n.timestamp.getTime() < 60 * 1000 // Within last minute
      );

      if (
        incompleteTasks.length > 0 &&
        completedTasks < totalTasks * 0.5 &&
        !reminderShownRef.current &&
        !hasSimilarNotification &&
        now - lastNotificationTimeRef.current > 60 * 1000 // At least 1 minute since last
      ) {
        // Find next incomplete task
        const nextTask = incompleteTasks[0];

        // Show encouraging reminder
        showTaskReminder(
          nextTask?.title || 'your next marketing task',
          () => {
            // Navigate to marketing track page
            navigate('/app/marketing-track');
            reminderShownRef.current = true;
            
            // Reset reminder flag after 24 hours
            setTimeout(() => {
              reminderShownRef.current = false;
            }, 24 * 60 * 60 * 1000);
          }
        );

        reminderShownRef.current = true;
        lastCheckRef.current = now;
        lastNotificationTimeRef.current = now;

        // Reset reminder flag after 24 hours
        setTimeout(() => {
          reminderShownRef.current = false;
        }, 24 * 60 * 60 * 1000);
      }

      lastCheckRef.current = now;
    }, 60 * 1000); // Check every minute, but only act every 5 minutes

    // Initial check after 5 minutes
    const initialTimeout = setTimeout(() => {
      lastCheckRef.current = Date.now();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(initialTimeout);
    };
  }, [user, activeGoal, showTaskReminder, navigate, notifications]);

  // Check when component first loads and user has been inactive
  useEffect(() => {
    if (!user || !activeGoal) {
      return;
    }

    // Check if user has been inactive (no tasks completed recently)
    const checkInitialActivity = async () => {
      try {
        const allTasks = activeGoal.modules.flatMap(module => module.tasks || []);
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(task => task.isCompleted).length;
        const incompleteTasks = allTasks.filter(task => !task.isCompleted);

        // If user has incomplete tasks and has made some progress but not much
        const hasSimilarNotification = notifications.some(n => 
          n.title === '💪 Keep Going!' && 
          n.type === 'info' &&
          Date.now() - n.timestamp.getTime() < 60 * 1000 // Within last minute
        );

        if (
          incompleteTasks.length > 0 &&
          completedTasks > 0 &&
          completedTasks < totalTasks * 0.3 &&
          !reminderShownRef.current &&
          !hasSimilarNotification &&
          Date.now() - lastNotificationTimeRef.current > 60 * 1000 // At least 1 minute since last
        ) {
          // Wait 30 seconds before showing initial reminder (don't be too pushy)
          setTimeout(() => {
            // Double-check we still don't have a similar notification
            const stillHasSimilar = notifications.some(n => 
              n.title === '💪 Keep Going!' && 
              n.type === 'info' &&
              Date.now() - n.timestamp.getTime() < 60 * 1000
            );

            if (!reminderShownRef.current && !stillHasSimilar) {
              const nextTask = incompleteTasks[0];
              showTaskReminder(
                nextTask?.title || 'your next marketing task',
                () => {
                  navigate('/app/marketing-track');
                }
              );
              reminderShownRef.current = true;
              lastNotificationTimeRef.current = Date.now();
              
              // Reset reminder flag after 24 hours
              setTimeout(() => {
                reminderShownRef.current = false;
              }, 24 * 60 * 60 * 1000);
            }
          }, 30 * 1000);
        }
      } catch (error) {
        logger.error('Error checking initial activity', error);
      }
    };

    checkInitialActivity();
  }, [user, activeGoal, showTaskReminder, navigate, notifications]);
}

