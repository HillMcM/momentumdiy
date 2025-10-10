import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import type { SocialMediaStrategy } from '../types';
import { logger } from '../utils/logger';
import { useNotifications } from '../contexts/NotificationContext';

// Tab components
import ContentPillarsTab from '../components/socialStrategy/ContentPillarsTab';
import BrandVoiceTab from '../components/socialStrategy/BrandVoiceTab';
import ScheduleTab from '../components/socialStrategy/ScheduleTab';
import TemplatesTab from '../components/socialStrategy/TemplatesTab';
import MetricsTab from '../components/socialStrategy/MetricsTab';
import CollaborationTab from '../components/socialStrategy/CollaborationTab';

type TabId = 'pillars' | 'voice' | 'schedule' | 'templates' | 'metrics' | 'collaboration';

const TABS: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'pillars', label: 'Content Pillars', icon: '📋' },
  { id: 'voice', label: 'Brand Voice & Visuals', icon: '🎨' },
  { id: 'schedule', label: 'Posting Schedule', icon: '📅' },
  { id: 'templates', label: 'Templates', icon: '🖼️' },
  { id: 'metrics', label: 'Metrics', icon: '📊' },
  { id: 'collaboration', label: 'Collaboration', icon: '👥' },
];

export default function SocialStrategyHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl || 'pillars');
  const [strategy, setStrategy] = useState<SocialMediaStrategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { addNotification } = useNotifications();

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabFromUrl && TABS.some(t => t.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    loadStrategy();
  }, []);

  const loadStrategy = async () => {
    try {
      setLoading(true);
      const result = await apiService.getSocialStrategy();
      
      if (result.success && result.data) {
        // Ensure all array fields have defaults
        const normalizedStrategy: SocialMediaStrategy = {
          ...result.data,
          contentPillars: result.data.contentPillars || [],
          brandVoice: result.data.brandVoice || { tone: [], adjectives: [], personalityNotes: '', styleGuide: '' },
          visualStyle: result.data.visualStyle || { colors: [], fonts: {}, imageStyle: '', designNotes: '' },
          postingSchedule: result.data.postingSchedule || { frequency: 3, days: [], postTypes: {} },
          baselineMetrics: result.data.baselineMetrics || { followers: 0, avgLikes: 0, avgComments: 0, storyViews: 0, date: '' },
          currentMetrics: result.data.currentMetrics || { followers: 0, avgLikes: 0, avgComments: 0, storyViews: 0, date: '' },
          weeklySnapshots: result.data.weeklySnapshots || [],
          collaborators: result.data.collaborators || []
        };
        setStrategy(normalizedStrategy);
      } else {
        logger.error('Failed to load strategy', { error: result.error });
      }
    } catch (error) {
      logger.error('Error loading strategy', error);
    } finally {
      setLoading(false);
    }
  };

  const saveStrategy = async () => {
    if (!strategy || !hasChanges) return;

    try {
      setSaving(true);
      const result = await apiService.updateSocialStrategy(strategy);
      
      if (result.success) {
        setHasChanges(false);
        addNotification({
          type: 'success',
          message: 'Strategy saved successfully'
        });
      } else {
        addNotification({
          type: 'error',
          message: `Failed to save: ${result.error}`
        });
      }
    } catch (error) {
      logger.error('Error saving strategy', error);
      addNotification({
        type: 'error',
        message: 'An error occurred while saving'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateStrategy = (updates: Partial<SocialMediaStrategy>) => {
    setStrategy(prev => prev ? { ...prev, ...updates } : null);
    setHasChanges(true);
  };

  // Auto-save when changes are made (debounced)
  useEffect(() => {
    if (!hasChanges) return;
    
    const timeout = setTimeout(() => {
      saveStrategy();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [strategy, hasChanges]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF8E81] mx-auto mb-4"></div>
          <p className="text-[#FFF1E7]/60">Loading your strategy...</p>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-[#FFF1E7]/40 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#FFF1E7] mb-4">No Strategy Found</h2>
          <p className="text-[#FFF1E7]/60 mb-6">
            You need an active social media track to access the Strategy Hub.
          </p>
          <button
            onClick={() => window.location.href = '/app/marketing-track'}
            className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Marketing Tracks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0A1A]">
      {/* Header */}
      <div className="bg-[#1A1625] border-b border-[#2A2438] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#FFF1E7] mb-2">
                Social Media Strategy Hub
              </h1>
              <p className="text-[#FFF1E7]/60">
                Your complete social media planning workspace
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {saving && (
                <span className="text-[#FFF1E7]/60 text-sm flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              )}
              {hasChanges && !saving && (
                <span className="text-[#FFF1E7]/40 text-sm">Unsaved changes</span>
              )}
              {!hasChanges && !saving && (
                <span className="text-green-400 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-6 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 rounded-t-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#0F0A1A] text-[#FFF1E7] border-t-2 border-[#EF8E81]'
                    : 'text-[#FFF1E7]/60 hover:text-[#FFF1E7] hover:bg-[#1A1625]'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#1A1625] rounded-lg border border-[#2A2438] p-6 md:p-8">
          {activeTab === 'pillars' && (
            <ContentPillarsTab
              pillars={strategy.contentPillars}
              onChange={(pillars) => updateStrategy({ contentPillars: pillars })}
            />
          )}
          
          {activeTab === 'voice' && (
            <BrandVoiceTab
              brandVoice={strategy.brandVoice}
              visualStyle={strategy.visualStyle}
              onBrandVoiceChange={(brandVoice) => updateStrategy({ brandVoice })}
              onVisualStyleChange={(visualStyle) => updateStrategy({ visualStyle })}
            />
          )}
          
          {activeTab === 'schedule' && (
            <ScheduleTab
              schedule={strategy.postingSchedule}
              onChange={(schedule) => updateStrategy({ postingSchedule: schedule })}
            />
          )}
          
          {activeTab === 'templates' && (
            <TemplatesTab trackId={strategy.trackId} />
          )}
          
          {activeTab === 'metrics' && (
            <MetricsTab
              baselineMetrics={strategy.baselineMetrics}
              currentMetrics={strategy.currentMetrics}
              weeklySnapshots={strategy.weeklySnapshots}
              onBaselineChange={(metrics) => updateStrategy({ baselineMetrics: metrics })}
              onCurrentChange={(metrics) => updateStrategy({ currentMetrics: metrics })}
              onAddSnapshot={(snapshot) => updateStrategy({
                weeklySnapshots: [...strategy.weeklySnapshots, snapshot]
              })}
            />
          )}
          
          {activeTab === 'collaboration' && (
            <CollaborationTab
              collaborators={strategy.collaborators}
              onCollaboratorsChange={(collaborators) => updateStrategy({ collaborators })}
              strategy={strategy}
            />
          )}
        </div>
      </div>
    </div>
  );
}

