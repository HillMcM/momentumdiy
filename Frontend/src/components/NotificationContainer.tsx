import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationToast from './NotificationToast';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification, markAsRead } = useNotifications();

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            onMarkAsRead={markAsRead}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;
