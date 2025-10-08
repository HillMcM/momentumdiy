import { useState, useEffect } from 'react';
import { apiService, BACKEND_BASE_URL } from '../services/api';
import { useAuth } from '../contexts/useAuth';
import { logger } from '../utils/logger';

interface EmailPreferences {
  weekly_progress: boolean;
  task_reminders: boolean;
  marketing_emails: boolean;
  trial_emails: boolean;
}

interface EmailPreferencesProps {
  onClose?: () => void;
}

export default function EmailPreferences({ onClose }: EmailPreferencesProps) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferences>({
    weekly_progress: true,
    task_reminders: true,
    marketing_emails: true,
    trial_emails: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load current preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        const response = await apiService.getEmailPreferences();
        
        if (response.success && response.data) {
          setPreferences(response.data);
        } else {
          logger.error('Failed to load email preferences', { error: response.error });
          setError('Failed to load email preferences');
        }
      } catch (err) {
        logger.error('Error loading email preferences', err);
        setError('Error loading email preferences');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Handle preference change
  const handlePreferenceChange = (key: keyof EmailPreferences, value: boolean) => {
    // Prevent disabling trial emails
    if (key === 'trial_emails' && !value) {
      return;
    }
    
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save preferences
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await apiService.updateEmailPreferences(preferences);
      
      if (response.success) {
        setSuccess('Email preferences updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to update email preferences');
      }
    } catch (err) {
      logger.error('Error saving email preferences', err);
      setError('Error saving email preferences');
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await apiService.resetEmailPreferences();
      
      if (response.success && response.data) {
        setPreferences(response.data);
        setSuccess('Email preferences reset to defaults!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to reset email preferences');
      }
    } catch (err) {
      logger.error('Error resetting email preferences', err);
      setError('Error resetting email preferences');
    } finally {
      setSaving(false);
    }
  };

  // Send test email
  const handleSendTestEmail = async () => {
    if (!user?.email) return;

    setSendingTest(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/notifications/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Test email sent to ${user.email}! Check your inbox.`);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.error || 'Failed to send test email');
      }
    } catch (err) {
      logger.error('Test email error', err);
      setError('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-6">
        <div className="flex items-center justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF8E81]"></div>
          <span className="ml-4 text-gray-400">Loading email preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Email Preferences</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-gray-400 mb-6">
        Choose which types of emails you'd like to receive. Trial-related emails are always sent to ensure you don't miss important billing information.
      </p>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Email Preferences */}
      <div className="space-y-4">
        {/* Weekly Progress Reports */}
        <div className="flex items-center justify-between p-4 bg-[#23233a] rounded-lg">
          <div>
            <h3 className="font-semibold text-white">
              Weekly Progress Reports
              <span className="ml-2 text-xs text-gray-500 font-normal">(Every Monday at 9 AM)</span>
            </h3>
            <p className="text-sm text-gray-400">Get a weekly summary of your marketing progress and achievements</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.weekly_progress}
              onChange={(e) => handlePreferenceChange('weekly_progress', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#EF8E81]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EF8E81]"></div>
          </label>
        </div>

        {/* Task Reminders */}
        <div className="flex items-center justify-between p-4 bg-[#23233a] rounded-lg">
          <div>
            <h3 className="font-semibold text-white">
              Task Reminders
              <span className="ml-2 text-xs text-gray-500 font-normal">(Wednesdays at 2 PM)</span>
            </h3>
            <p className="text-sm text-gray-400">Receive gentle reminders when you haven't been active for a few days</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.task_reminders}
              onChange={(e) => handlePreferenceChange('task_reminders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#EF8E81]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EF8E81]"></div>
          </label>
        </div>

        {/* Marketing Emails */}
        <div className="flex items-center justify-between p-4 bg-[#23233a] rounded-lg">
          <div>
            <h3 className="font-semibold text-white">
              Marketing Tips & Updates
              <span className="ml-2 text-xs text-gray-500 font-normal">(Monthly)</span>
            </h3>
            <p className="text-sm text-gray-400">Get marketing tips, feature updates, and helpful resources</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.marketing_emails}
              onChange={(e) => handlePreferenceChange('marketing_emails', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#EF8E81]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EF8E81]"></div>
          </label>
        </div>

        {/* Trial Emails - Always Enabled */}
        <div className="flex items-center justify-between p-4 bg-[#23233a] rounded-lg opacity-75">
          <div>
            <h3 className="font-semibold text-white">Trial & Billing Notifications</h3>
            <p className="text-sm text-gray-400">Important trial expiration and billing information (required)</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={true}
              disabled={true}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#EF8E81] rounded-full flex items-center justify-end pr-1">
              <div className="w-5 h-5 bg-white rounded-full"></div>
            </div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-[#EF8E81] hover:bg-[#EF8E81]/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        
        <button
          onClick={handleSendTestEmail}
          disabled={sendingTest || !user}
          className="px-4 py-3 border border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendingTest ? '📧 Sending...' : '📧 Send Test Email'}
        </button>
        
        <button
          onClick={handleReset}
          disabled={saving}
          className="px-4 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
