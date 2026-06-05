import React, { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { supabase } from '../lib/supabase';
import { useNotificationHelpers } from '../hooks/useNotificationHelpers';
import { logger } from '../utils/logger';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';

interface AccountSettingsProps {
  onDataExport?: () => void;
  onAccountDelete?: () => void;
}

export default function AccountSettings({ onDataExport, onAccountDelete }: AccountSettingsProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotificationHelpers();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSecondDeleteConfirm, setShowSecondDeleteConfirm] = useState(false);

  const handleExportData = async () => {
    if (!user) return;

    try {
      setExporting(true);
      
      // Fetch all user data
      const [profileData, tasksData, projectsData, marketingGoalsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('projects').select('*').eq('user_id', user.id),
        supabase.from('marketing_goals').select('*').eq('user_id', user.id)
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata
        },
        profile: profileData.data,
        tasks: tasksData.data || [],
        projects: projectsData.data || [],
        marketingGoals: marketingGoalsData.data || [],
        exportVersion: '1.0'
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `momentumdiy-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess('Data Exported', 'Your data has been downloaded successfully.');
      onDataExport?.();
    } catch (error) {
      logger.error('Error exporting data', error);
      showError('Export Failed', 'Failed to export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteFirst = () => {
    setShowDeleteConfirm(false);
    setShowSecondDeleteConfirm(true);
  };

  const confirmDeleteFinal = async () => {
    if (!user) return;

    setShowSecondDeleteConfirm(false);
    setDeleting(true);

    try {
      // Delete user data from backend
      const response = await apiService.deleteAccount();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete account');
      }

      // Sign out
      await signOut();
      
      // Navigate to landing page
      navigate('/');
      
      showSuccess('Account Deleted', 'Your account has been permanently deleted.');
      onAccountDelete?.();
    } catch (error) {
      logger.error('Error deleting account', error);
      showError('Deletion Failed', 'Failed to delete your account. Please contact support if the issue persists.');
      setDeleting(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(239, 68, 68, 0.05)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '12px',
      padding: '1.5rem',
      marginTop: '1.5rem'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600, color: '#FFF1E7' }}>
        ⚠️ Account Management
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Data Export */}
        <div style={{
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#FFF1E7' }}>
              📥 Export Your Data
            </h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.7, color: '#FFF1E7' }}>
              Download all your data as a JSON file. Includes your profile, tasks, projects, and marketing tracks.
            </p>
          </div>
          <button
            onClick={handleExportData}
            disabled={exporting}
            style={{
              padding: '0.75rem 1.5rem',
              background: exporting ? '#6b7280' : '#3b82f6',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              minHeight: '44px',
              transition: 'background 0.2s'
            }}
          >
            {exporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>

        {/* Account Deletion */}
        <div style={{
          padding: '1rem',
          background: 'rgba(239, 68, 68, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#EF4444' }}>
              🗑️ Delete Account
            </h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.8, color: '#FFF1E7' }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            style={{
              padding: '0.75rem 1.5rem',
              background: deleting ? '#6b7280' : '#EF4444',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              cursor: deleting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              minHeight: '44px',
              transition: 'background 0.2s'
            }}
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
      
      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Account?"
        message="Are you sure you want to delete your account? This action cannot be undone. All your data, tasks, projects, and marketing tracks will be permanently deleted."
        confirmLabel="Continue"
        cancelLabel="Cancel"
        confirmColor="#EF4444"
        onConfirm={confirmDeleteFirst}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      
      <ConfirmDialog
        isOpen={showSecondDeleteConfirm}
        title="Final Confirmation"
        message="This is your last chance. Are you absolutely sure you want to permanently delete your account? This action cannot be undone."
        confirmLabel="Yes, Delete Everything"
        cancelLabel="Cancel"
        confirmColor="#EF4444"
        onConfirm={confirmDeleteFinal}
        onCancel={() => setShowSecondDeleteConfirm(false)}
      />
    </div>
  );
}

