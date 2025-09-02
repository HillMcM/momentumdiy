import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Types for analytics data
export interface BusinessMetrics {
  googleBusinessProfile?: {
    views: number;
    calls: number;
    directionRequests: number;
    reviews: number;
    rating: number;
    lastUpdated: string;
  };
  socialMedia?: {
    platform: string;
    followers: number;
    engagement: number;
    reach: number;
    lastUpdated: string;
  }[];
  website?: {
    visitors: number;
    bounceRate: number;
    conversionRate: number;
    lastUpdated: string;
  };
  localCompetition?: {
    competitorCount: number;
    averageRating: number;
    marketPosition: string;
    lastUpdated: string;
  };
}

export interface AnalyticsInsight {
  id: string;
  type: 'success' | 'warning' | 'opportunity' | 'trend';
  title: string;
  description: string;
  metric: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  actionable: boolean;
  actionText?: string;
  timestamp: string;
}

interface AnalyticsContextValue {
  metrics: BusinessMetrics | null;
  insights: AnalyticsInsight[];
  isLoading: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
  getMetricsForAI: () => BusinessMetrics | null;
  updateMetric: (platform: string, data: any) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load metrics from Supabase
  const loadMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('last_updated', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setMetrics(data[0].metrics);
        generateInsights(data[0].metrics);
      } else {
        // Generate mock data if no real data exists
        const mockMetrics = generateMockMetrics();
        setMetrics(mockMetrics);
        generateInsights(mockMetrics);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setIsLoading(false);
    }
  }, [generateMockMetrics]);

  // Generate mock metrics for development/demo
  const generateMockMetrics = useCallback((): BusinessMetrics => {
    return {
      googleBusinessProfile: {
        views: Math.floor(Math.random() * 500) + 100,
        calls: Math.floor(Math.random() * 25) + 5,
        directionRequests: Math.floor(Math.random() * 15) + 3,
        reviews: Math.floor(Math.random() * 10) + 2,
        rating: Number((Math.random() * 0.8 + 4.1).toFixed(1)),
        lastUpdated: new Date().toISOString()
      },
      socialMedia: [
        {
          platform: 'Facebook',
          followers: Math.floor(Math.random() * 300) + 50,
          engagement: Number((Math.random() * 3 + 1).toFixed(1)),
          reach: Math.floor(Math.random() * 1000) + 200,
          lastUpdated: new Date().toISOString()
        },
        {
          platform: 'Instagram',
          followers: Math.floor(Math.random() * 250) + 30,
          engagement: Number((Math.random() * 4 + 2).toFixed(1)),
          reach: Math.floor(Math.random() * 800) + 150,
          lastUpdated: new Date().toISOString()
        }
      ],
      website: {
        visitors: Math.floor(Math.random() * 2000) + 500,
        bounceRate: Number((Math.random() * 20 + 30).toFixed(1)),
        conversionRate: Number((Math.random() * 3 + 1).toFixed(1)),
        lastUpdated: new Date().toISOString()
      },
      localCompetition: {
        competitorCount: Math.floor(Math.random() * 5) + 3,
        averageRating: Number((Math.random() * 0.8 + 4.1).toFixed(1)),
        marketPosition: Math.random() > 0.5 ? 'Leading' : 'Competitive',
        lastUpdated: new Date().toISOString()
      }
    };
  }, []);

  // Generate AI insights from metrics
  const generateInsights = useCallback((metricsData: BusinessMetrics) => {
    const newInsights: AnalyticsInsight[] = [];

    // GBP Insights
    if (metricsData.googleBusinessProfile) {
      const gbp = metricsData.googleBusinessProfile;

      if (gbp.calls > 10) {
        newInsights.push({
          id: 'gbp-calls-high',
          type: 'success',
          title: 'Strong Phone Performance',
          description: `You've received ${gbp.calls} calls this week - that's excellent engagement!`,
          metric: `${gbp.calls} calls`,
          change: 15,
          changeType: 'increase',
          actionable: true,
          actionText: 'Update your GBP with current hours and specials',
          timestamp: new Date().toISOString()
        });
      }

      if (gbp.rating < 4.5) {
        newInsights.push({
          id: 'gbp-rating-improvement',
          type: 'opportunity',
          title: 'Rating Improvement Opportunity',
          description: 'Your Google rating could use some attention to compete better locally.',
          metric: `${gbp.rating} stars`,
          change: -0.2,
          changeType: 'decrease',
          actionable: true,
          actionText: 'Reply to reviews and ask satisfied customers for feedback',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Social Media Insights
    if (metricsData.socialMedia && metricsData.socialMedia.length > 0) {
      const totalEngagement = metricsData.socialMedia.reduce((sum, platform) => sum + platform.engagement, 0);
      const avgEngagement = totalEngagement / metricsData.socialMedia.length;

      if (avgEngagement > 5) {
        newInsights.push({
          id: 'social-engagement-high',
          type: 'success',
          title: 'Social Media Engagement Strong',
          description: 'Your social content is resonating well with your audience!',
          metric: `${avgEngagement.toFixed(1)}% engagement`,
          change: 8,
          changeType: 'increase',
          actionable: false,
          timestamp: new Date().toISOString()
        });
      }
    }

    setInsights(newInsights);
  }, []);

  // Refresh all metrics
  const refreshMetrics = useCallback(async () => {
    await loadMetrics();
  }, [loadMetrics]);

  // Get metrics formatted for AI context
  const getMetricsForAI = useCallback(() => {
    return metrics;
  }, [metrics]);

  // Update specific metric
  const updateMetric = useCallback(async (platform: string, data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedMetrics = { ...metrics };

      if (platform === 'googleBusinessProfile') {
        updatedMetrics.googleBusinessProfile = {
          ...data,
          lastUpdated: new Date().toISOString()
        };
      } else if (platform.startsWith('social_')) {
        const platformName = platform.replace('social_', '');
        const socialIndex = updatedMetrics.socialMedia?.findIndex(s => s.platform === platformName) ?? -1;

        if (socialIndex >= 0 && updatedMetrics.socialMedia) {
          updatedMetrics.socialMedia[socialIndex] = {
            ...updatedMetrics.socialMedia[socialIndex],
            ...data,
            lastUpdated: new Date().toISOString()
          };
        }
      }

      // Save to Supabase
      const { error } = await supabase
        .from('business_metrics')
        .upsert({
          user_id: user.id,
          metrics: updatedMetrics,
          last_updated: new Date().toISOString()
        });

      if (error) throw error;

      setMetrics(updatedMetrics);
      generateInsights(updatedMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update metrics');
    }
  }, [metrics, generateInsights]);

  // Load metrics on mount
  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Auto-refresh metrics every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadMetrics();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [loadMetrics]);

  const value: AnalyticsContextValue = {
    metrics,
    insights,
    isLoading,
    error,
    refreshMetrics,
    getMetricsForAI,
    updateMetric
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
