import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import type { SocialMediaStrategy } from '../types';
import { logger } from '../utils/logger';

export default function SharedStrategyView() {
  const { accessCode } = useParams<{ accessCode: string }>();
  const [strategy, setStrategy] = useState<SocialMediaStrategy | null>(null);
  const [ownerName, setOwnerName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessCode) {
      loadSharedStrategy();
    }
  }, [accessCode]);

  const loadSharedStrategy = async () => {
    if (!accessCode) return;

    try {
      setLoading(true);
      const result = await apiService.getSharedStrategy(accessCode);
      
      if (result.success && result.data) {
        setStrategy(result.data.strategy);
        setOwnerName(result.data.ownerName || 'Business');
      } else {
        setError(result.error || 'Failed to load strategy');
      }
    } catch (error) {
      logger.error('Error loading shared strategy', error);
      setError('An error occurred while loading the strategy');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF8E81] mx-auto mb-4"></div>
          <p className="text-[#FFF1E7]/60">Loading strategy...</p>
        </div>
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="min-h-screen bg-[#0F0A1A] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#FFF1E7] mb-4">Access Denied</h2>
          <p className="text-[#FFF1E7]/60">
            {error || 'This share link is invalid, expired, or has been revoked.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0A1A]">
      {/* Header */}
      <div className="bg-[#1A1625] border-b border-[#2A2438]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3 mb-2">
            <svg className="w-6 h-6 text-[#EF8E81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-[#FFF1E7]/60 text-sm">Shared Strategy (View Only)</span>
          </div>
          <h1 className="text-3xl font-bold text-[#FFF1E7] mb-2">
            {ownerName}'s Social Media Strategy
          </h1>
          <p className="text-[#FFF1E7]/60">
            Viewing a shared social media strategy
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Content Pillars */}
        {strategy.contentPillars.length > 0 && (
          <section className="bg-[#1A1625] rounded-lg border border-[#2A2438] p-6">
            <h2 className="text-2xl font-bold text-[#FFF1E7] mb-6">Content Pillars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategy.contentPillars.map((pillar, index) => (
                <div
                  key={pillar.id}
                  className="bg-[#0F0A1A]/50 rounded-lg p-4 border-l-4"
                  style={{ borderLeftColor: pillar.colorTag }}
                >
                  <h3 className="text-[#FFF1E7] font-semibold mb-2">{pillar.name}</h3>
                  <p className="text-[#FFF1E7]/60 text-sm mb-3">{pillar.description}</p>
                  {pillar.exampleIdeas.filter(Boolean).length > 0 && (
                    <div>
                      <div className="text-[#FFF1E7]/40 text-xs mb-1">Example Ideas:</div>
                      <ul className="space-y-1">
                        {pillar.exampleIdeas.filter(Boolean).map((idea, i) => (
                          <li key={i} className="text-[#FFF1E7]/60 text-sm flex items-start">
                            <span className="mr-2">•</span>
                            <span>{idea}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Brand Voice & Visual Style */}
        <section className="bg-[#1A1625] rounded-lg border border-[#2A2438] p-6">
          <h2 className="text-2xl font-bold text-[#FFF1E7] mb-6">Brand Voice & Visual Style</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand Voice */}
            <div>
              <h3 className="text-[#FFF1E7] font-semibold mb-3">Brand Voice</h3>
              {strategy.brandVoice.tone && strategy.brandVoice.tone.length > 0 && (
                <div className="mb-3">
                  <div className="text-[#FFF1E7]/60 text-sm mb-2">Tone:</div>
                  <div className="flex flex-wrap gap-2">
                    {strategy.brandVoice.tone.map((tone, i) => (
                      <span key={i} className="bg-[#EF8E81] text-white px-3 py-1 rounded-full text-sm">
                        {tone}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {strategy.brandVoice.adjectives && strategy.brandVoice.adjectives.length > 0 && (
                <div className="mb-3">
                  <div className="text-[#FFF1E7]/60 text-sm mb-2">Adjectives:</div>
                  <div className="flex flex-wrap gap-2">
                    {strategy.brandVoice.adjectives.map((adj, i) => (
                      <span key={i} className="bg-[#10b981] text-white px-3 py-1 rounded-full text-sm">
                        {adj}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {strategy.brandVoice.personalityNotes && (
                <div className="mt-3">
                  <div className="text-[#FFF1E7]/60 text-sm mb-1">Personality Notes:</div>
                  <p className="text-[#FFF1E7]/80 text-sm">{strategy.brandVoice.personalityNotes}</p>
                </div>
              )}
            </div>

            {/* Visual Style */}
            <div>
              <h3 className="text-[#FFF1E7] font-semibold mb-3">Visual Style</h3>
              {strategy.visualStyle.colors && strategy.visualStyle.colors.length > 0 && (
                <div className="mb-3">
                  <div className="text-[#FFF1E7]/60 text-sm mb-2">Brand Colors:</div>
                  <div className="flex flex-wrap gap-2">
                    {strategy.visualStyle.colors.map((color, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className="w-12 h-12 rounded border-2 border-[#3A3448]"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-[#FFF1E7]/60 text-xs mt-1 font-mono">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {strategy.visualStyle.fonts && (strategy.visualStyle.fonts.heading || strategy.visualStyle.fonts.body) && (
                <div className="mt-3">
                  <div className="text-[#FFF1E7]/60 text-sm mb-1">Fonts:</div>
                  {strategy.visualStyle.fonts.heading && (
                    <p className="text-[#FFF1E7]/80 text-sm">Heading: {strategy.visualStyle.fonts.heading}</p>
                  )}
                  {strategy.visualStyle.fonts.body && (
                    <p className="text-[#FFF1E7]/80 text-sm">Body: {strategy.visualStyle.fonts.body}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Posting Schedule */}
        {strategy.postingSchedule.days && strategy.postingSchedule.days.length > 0 && (
          <section className="bg-[#1A1625] rounded-lg border border-[#2A2438] p-6">
            <h2 className="text-2xl font-bold text-[#FFF1E7] mb-6">Posting Schedule</h2>
            <div className="space-y-2">
              {strategy.postingSchedule.days.map(day => {
                const postType = strategy.postingSchedule.postTypes?.[day];
                const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
                
                return (
                  <div key={day} className="flex items-center justify-between bg-[#0F0A1A]/50 rounded-lg p-3">
                    <span className="text-[#FFF1E7] font-medium">{dayLabel}</span>
                    {postType && (
                      <span
                        className="px-3 py-1 rounded-full text-white text-sm font-medium"
                        style={{
                          backgroundColor: postType === 'educate' ? '#3b82f6' : postType === 'promote' ? '#EF8E81' : '#10b981'
                        }}
                      >
                        {postType.charAt(0).toUpperCase() + postType.slice(1)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Metrics */}
        {(strategy.baselineMetrics.followers || strategy.currentMetrics.followers) && (
          <section className="bg-[#1A1625] rounded-lg border border-[#2A2438] p-6">
            <h2 className="text-2xl font-bold text-[#FFF1E7] mb-6">Metrics Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0F0A1A]/50 rounded-lg p-4">
                <div className="text-[#FFF1E7]/60 text-sm mb-1">Followers</div>
                <div className="text-[#FFF1E7] text-2xl font-bold">{strategy.currentMetrics.followers || 0}</div>
                {strategy.baselineMetrics.followers && (
                  <div className="text-[#FFF1E7]/40 text-xs mt-1">
                    Baseline: {strategy.baselineMetrics.followers}
                  </div>
                )}
              </div>
              <div className="bg-[#0F0A1A]/50 rounded-lg p-4">
                <div className="text-[#FFF1E7]/60 text-sm mb-1">Avg. Likes</div>
                <div className="text-[#FFF1E7] text-2xl font-bold">{strategy.currentMetrics.avgLikes || 0}</div>
                {strategy.baselineMetrics.avgLikes && (
                  <div className="text-[#FFF1E7]/40 text-xs mt-1">
                    Baseline: {strategy.baselineMetrics.avgLikes}
                  </div>
                )}
              </div>
              <div className="bg-[#0F0A1A]/50 rounded-lg p-4">
                <div className="text-[#FFF1E7]/60 text-sm mb-1">Avg. Comments</div>
                <div className="text-[#FFF1E7] text-2xl font-bold">{strategy.currentMetrics.avgComments || 0}</div>
                {strategy.baselineMetrics.avgComments && (
                  <div className="text-[#FFF1E7]/40 text-xs mt-1">
                    Baseline: {strategy.baselineMetrics.avgComments}
                  </div>
                )}
              </div>
              <div className="bg-[#0F0A1A]/50 rounded-lg p-4">
                <div className="text-[#FFF1E7]/60 text-sm mb-1">Story Views</div>
                <div className="text-[#FFF1E7] text-2xl font-bold">{strategy.currentMetrics.storyViews || 0}</div>
                {strategy.baselineMetrics.storyViews && (
                  <div className="text-[#FFF1E7]/40 text-xs mt-1">
                    Baseline: {strategy.baselineMetrics.storyViews}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Footer Note */}
        <div className="text-center text-[#FFF1E7]/40 text-sm py-4">
          This is a read-only view of {ownerName}'s social media strategy.
        </div>
      </div>
    </div>
  );
}

