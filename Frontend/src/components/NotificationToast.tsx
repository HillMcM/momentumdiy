import React from 'react';
import type { Notification } from '../contexts/NotificationContext';

interface NotificationToastProps {
  notification: Notification;
  onRemove: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onRemove,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };


  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-400';
      case 'error':
        return 'border-red-400';
      case 'warning':
        return 'border-yellow-400';
      case 'info':
      default:
        return 'border-blue-400';
    }
  };

  return (
    <div
      className={`relative max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4 ${getBorderColor()}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">{getIcon()}</span>
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {notification.message}
            </p>
            {(notification.action || notification.secondaryAction) && (
              <div className="mt-2 flex gap-3 flex-wrap">
                {notification.action && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      notification.action?.onClick();
                    }}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 underline cursor-pointer"
                  >
                    {notification.action.label}
                  </button>
                )}
                {notification.secondaryAction && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      notification.secondaryAction?.onClick();
                    }}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 underline cursor-pointer"
                  >
                    {notification.secondaryAction.label}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onRemove(notification.id)}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
