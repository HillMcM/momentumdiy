import React from 'react';
import { useNotificationHelpers } from '../hooks/useNotificationHelpers';

const NotificationDemo: React.FC = () => {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showTaskReminder,
    showProgressUpdate,
    showSubscriptionUpdate,
    showWelcome,
  } = useNotificationHelpers();

  const handleSuccess = () => {
    showSuccess('Task Completed!', 'Your marketing task has been completed successfully.');
  };

  const handleError = () => {
    showError('Something went wrong', 'Failed to save your changes. Please try again.');
  };

  const handleWarning = () => {
    showWarning('Trial Ending Soon', 'Your free trial expires in 3 days. Upgrade now to continue.');
  };

  const handleInfo = () => {
    showInfo('New Feature Available', 'Check out our new AI marketing assistant!');
  };

  const handleTaskReminder = () => {
    showTaskReminder('Create social media content', () => {
      console.log('Navigate to task tracker');
    });
  };

  const handleProgressUpdate = () => {
    showProgressUpdate(8, 12, () => {
      console.log('Navigate to progress view');
    });
  };

  const handleSubscriptionUpdate = () => {
    showSubscriptionUpdate('Your subscription has been activated!', () => {
      console.log('Navigate to subscription page');
    });
  };

  const handleWelcome = () => {
    showWelcome('Hillary', () => {
      console.log('Navigate to onboarding');
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Notification Demo</h2>
      <p className="text-gray-600 mb-6">
        Click the buttons below to test different types of in-app notifications.
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleSuccess}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Success Notification
        </button>
        
        <button
          onClick={handleError}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Error Notification
        </button>
        
        <button
          onClick={handleWarning}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          Warning Notification
        </button>
        
        <button
          onClick={handleInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Info Notification
        </button>
        
        <button
          onClick={handleTaskReminder}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Task Reminder
        </button>
        
        <button
          onClick={handleProgressUpdate}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Progress Update
        </button>
        
        <button
          onClick={handleSubscriptionUpdate}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Subscription Update
        </button>
        
        <button
          onClick={handleWelcome}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          Welcome Message
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">How to Use Notifications in Your Code:</h3>
        <pre className="text-sm text-gray-700 overflow-x-auto">
{`import { useNotificationHelpers } from '../hooks/useNotificationHelpers';

const MyComponent = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotificationHelpers();
  
  const handleAction = () => {
    showSuccess('Success!', 'Your action was completed.');
  };
  
  return <button onClick={handleAction}>Do Something</button>;
};`}
        </pre>
      </div>
    </div>
  );
};

export default NotificationDemo;
