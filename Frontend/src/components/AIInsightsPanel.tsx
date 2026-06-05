import { useState, useEffect } from 'react';
import { BACKEND_BASE_URL } from '../services/api';
import { logger } from '../utils/logger';

interface Insight {
  type: 'skill' | 'opportunity' | 'competitive';
  message: string;
  action: string;
}

interface AIInsightsPanelProps {
  profile: {
    skill_levels?: any;
    business_category?: string | null;
    location?: string | null;
    competitors?: string[] | null;
  };
}

export default function AIInsightsPanel({ profile }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/profile/business-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillLevels: profile.skill_levels || {},
          businessCategory: profile.business_category || 'General',
          location: profile.location || 'Unknown',
          competitors: profile.competitors || []
        })
      });

      const data = await response.json();
      if (data.success) {
        setInsights(data.insights || []);
      } else {
        setError(data.error || 'Failed to load insights');
      }
    } catch (err) {
      setError('Unable to connect to AI insights service');
      logger.error('AI Insights error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-fetch insights when profile data is available
    if (profile.business_category || (profile.skill_levels && Object.keys(profile.skill_levels).length > 0)) {
      fetchInsights();
    }
  }, [profile.business_category, profile.skill_levels]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'skill': return '🎓';
      case 'opportunity': return '💡';
      case 'competitive': return '🎯';
      default: return '✨';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'skill': return '#8B5CF6'; // Purple
      case 'opportunity': return '#D4AF37'; // Gold
      case 'competitive': return '#EF8E81'; // Coral
      default: return '#10B981';
    }
  };

  return (
    <div style={{
      background: '#22202F',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '1.5rem',
      marginTop: '1rem'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
          🤖 AI Business Insights
        </h3>
        <button
          onClick={fetchInsights}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid rgba(239, 142, 129, 0.3)',
            background: 'rgba(239, 142, 129, 0.1)',
            color: '#EF8E81',
            fontSize: '0.85rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '🔄 Analyzing...' : '🔄 Refresh Insights'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#EF4444',
          fontSize: '0.85rem',
          marginBottom: '1rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
          <div style={{ 
            display: 'inline-block',
            width: '32px',
            height: '32px',
            border: '3px solid rgba(239, 142, 129, 0.3)',
            borderTopColor: '#EF8E81',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
            Analyzing your business profile...
          </p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {!loading && insights.length > 0 && (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {insights.map((insight, index) => (
            <div
              key={index}
              style={{
                background: '#1B1628',
                border: `1px solid ${getInsightColor(insight.type)}30`,
                borderLeft: `4px solid ${getInsightColor(insight.type)}`,
                borderRadius: '8px',
                padding: '1rem'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.75rem' 
              }}>
                <span style={{ fontSize: '1.5rem' }}>
                  {getInsightIcon(insight.type)}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '0.9rem',
                    color: '#FFF1E7',
                    lineHeight: '1.5'
                  }}>
                    {insight.message}
                  </p>
                  {insight.action && (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: `${getInsightColor(insight.type)}15`,
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      color: getInsightColor(insight.type),
                      fontWeight: 500
                    }}>
                      💡 {insight.action}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && insights.length === 0 && !error && (
        <p style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          opacity: 0.6,
          fontSize: '0.9rem'
        }}>
          Complete your business profile to receive personalized AI insights!
        </p>
      )}
    </div>
  );
}

