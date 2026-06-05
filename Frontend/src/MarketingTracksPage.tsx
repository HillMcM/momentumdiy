import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config/environment';
import { logger } from './utils/logger';

interface TrackModule {
  week_number: number;
  title: string;
  task_count?: number;
}

interface TrackPreview {
  id: string;
  title: string;
  description: string;
  industry_tags: string[];
  duration_weeks: number;
  modules: TrackModule[];
  phases?: any[];
  slug?: string;
}

export default function MarketingTracksPage() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<TrackPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all published tracks
      const response = await fetch(`${API_URL}/api/marketing/goals`);
      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to load tracks');
        return;
      }

      const trackList: TrackPreview[] = result.data || [];

      // Fetch preview data (modules) for each track
      const tracksWithModules = await Promise.all(
        trackList.map(async (track) => {
          try {
            const previewResponse = await fetch(`${API_URL}/api/marketing/tracks/${track.id}/preview`);
            const previewResult = await previewResponse.json();

            if (previewResult.success && previewResult.data) {
              return {
                ...track,
                modules: previewResult.data.modules || []
              };
            }
            return { ...track, modules: [] };
          } catch (err) {
            logger.error(`Error loading preview for track ${track.id}`, err);
            return { ...track, modules: [] };
          }
        })
      );

      setTracks(tracksWithModules);
    } catch (err) {
      logger.error('Error loading tracks', err);
      setError('Failed to load marketing tracks');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B1628] via-[#231C37] to-[#1B1628] flex items-center justify-center">
        <div className="text-white text-xl">Loading tracks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B1628] via-[#231C37] to-[#1B1628] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="px-6 py-2 bg-[#2A243E] text-white rounded-lg hover:bg-[#3A344E]"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'radial-gradient(1200px 600px at 20% 20%, #65170C 0%, #191628 70%)'
    }}>
      {/* Decorative gradient blurs */}
      <div className="pointer-events-none absolute -top-24 -left-16 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-[#EF8E81]/40 via-fuchsia-500/25 to-sky-400/20 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-sky-400/20 via-purple-500/20 to-[#EF8E81]/30 blur-3xl"></div>
      
      {/* Navigation Header */}
      <header className="relative bg-[#191628]/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between" role="navigation" aria-label="Main navigation">
            <button
              onClick={() => { window.location.href = '/'; }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src="/assets/octopus_icon.png" alt="MomentumDIY octopus logo" className="w-12 h-12" />
              <span className="text-lg font-extrabold tracking-tight text-white">MomentumDIY</span>
            </button>
            <div className="hidden sm:flex items-center gap-4">
              <button
                onClick={() => { window.location.href = '/'; }}
                className="text-white/80 hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/features')}
                className="text-white/80 hover:text-white transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => navigate('/tracks')}
                className="text-white/90 hover:text-white font-semibold transition-colors"
              >
                Tracks
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="text-white/90 hover:text-white font-semibold transition-colors"
              >
                Sign in
              </button>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="sm:hidden text-white/90 hover:text-white font-semibold"
            >
              Sign in
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section & Tracks Tabbed Interface */}
      <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight text-center">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EF8E81] to-[#D4AF37]">90-Day Marketing Track</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Each track is a complete 12-week program designed to help you achieve a specific marketing goal. 
            Pick the one that matches where you want to grow.
          </p>
        </div>
        {tracks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/80 text-lg">No tracks available at the moment.</p>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="mt-6 px-6 py-2 bg-[#EF8E81] text-white rounded-lg hover:bg-[#E67A6E]"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-8 lg:p-10">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-white/10">
              {tracks.map((track, idx) => (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrackIndex(idx)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedTrackIndex === idx
                      ? 'bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white'
                      : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {track.title}
                </button>
              ))}
            </div>

            {/* Selected Track Content */}
            {tracks[selectedTrackIndex] && (() => {
              const selectedTrack = tracks[selectedTrackIndex];
              
              // Extract example outcomes from description
              // Look for patterns like "Example outcomes:" followed by bullet points or comma-separated list
              const extractOutcomes = (description: string): string[] => {
                const outcomes: string[] = [];
                
                // Pattern 1: "Example outcomes:" followed by bullet points or comma-separated list
                // Try to match with newline first, then try inline (same line)
                let exampleOutcomesMatch = description.match(/(?:Example outcomes?):\s*([\s\S]*?)(?=\n\n[A-Z]|$)/i);
                if (!exampleOutcomesMatch) {
                  // Try inline format (same line, ends with period or end of string)
                  exampleOutcomesMatch = description.match(/(?:Example outcomes?):\s*([^.]*(?:\.[^.]*)*?)(?=\s+[A-Z]|$)/i);
                }
                
                if (exampleOutcomesMatch) {
                  const outcomesText = exampleOutcomesMatch[1].trim();
                  
                  // First try to extract bullet points
                  const bulletMatches = outcomesText.match(/^\s*[-*•]\s*(.+)$/gm);
                  if (bulletMatches && bulletMatches.length > 0) {
                    const bullets = bulletMatches.map(m => m.replace(/^\s*[-*•]\s*/, '').trim()).filter(s => s.length > 0);
                    outcomes.push(...bullets);
                  } else {
                    // If no bullets, try comma-separated format
                    const commaSeparated = outcomesText.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    if (commaSeparated.length > 0) {
                      outcomes.push(...commaSeparated);
                    }
                  }
                }
                
                // Pattern 2: Look for bullet-like patterns anywhere in description (fallback)
                if (outcomes.length === 0) {
                  const bulletMatches = description.match(/(?:^|\n)[\s]*[-*•]\s*([^\n]+)/g);
                  if (bulletMatches && bulletMatches.length > 0) {
                    const bullets = bulletMatches.map(m => m.replace(/^[\s]*[-*•]\s*/, '').trim()).filter(s => s.length > 0);
                    if (bullets.length > 0) {
                      outcomes.push(...bullets);
                    }
                  }
                }
                
                return outcomes.slice(0, 5); // Limit to 5 outcomes
              };
              
              const outcomes = extractOutcomes(selectedTrack.description);
              
              // Remove the "Example outcomes:" section and all bullet points from description
              let descriptionWithoutOutcomes = selectedTrack.description
                .replace(/(?:Example outcomes?):\s*[\s\S]*?(?=\n\n[A-Z]|$)/i, '')
                .replace(/(?:^|\n)[\s]*[-*•]\s*[^\n]+/g, '')
                .replace(/Example outcomes?:\s*[^.]*(?:\.[^.]*)*/gi, '') // Also remove inline comma-separated outcomes
                .trim();
              
              // Clean up any double newlines or extra whitespace
              descriptionWithoutOutcomes = descriptionWithoutOutcomes.replace(/\n{3,}/g, '\n\n').trim();
              
              return (
                <div>
                  {/* Track Title and Description */}
                  <div className="mb-12">
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 text-left">{selectedTrack.title}</h2>
                    {outcomes.length > 0 ? (
                      <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <p className="text-lg text-white/85 max-w-3xl leading-relaxed flex-1 text-left">{descriptionWithoutOutcomes || selectedTrack.description}</p>
                        <div className="lg:w-80 flex-shrink-0">
                          <h3 className="text-xl font-bold text-white mb-4 text-left">Example Outcomes</h3>
                          <ul className="space-y-3 text-left">
                            {outcomes.map((outcome, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-white/85">
                                <span className="text-[#EF8E81] mt-1 flex-shrink-0">→</span>
                                <span>{outcome}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p className="text-lg text-white/85 max-w-3xl leading-relaxed mx-auto text-center">{selectedTrack.description}</p>
                    )}
                    {selectedTrack.industry_tags && selectedTrack.industry_tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {selectedTrack.industry_tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-[#EF8E81]/20 text-[#EF8E81] text-sm font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4x3 Grid of Weeks */}
                  {selectedTrack.modules && selectedTrack.modules.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                      {selectedTrack.modules.map((module, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-white/20 transition-all hover:transform hover:-translate-y-1"
                        >
                          <div className="text-center mb-2">
                            <div className="text-2xl font-extrabold text-[#EF8E81] mb-1">Week {module.week_number}</div>
                            <div className="text-xs text-white/60 mb-2">
                              {module.task_count !== undefined ? `${module.task_count} task${module.task_count !== 1 ? 's' : ''}` : 'Tasks'}
                            </div>
                          </div>
                          <h4 className="text-sm font-semibold text-white text-left leading-tight">{module.title}</h4>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* CTA Button */}
                  <div className="text-center mt-8">
                    <button
                      onClick={() => navigate('/auth?mode=signup&redirect=/app')}
                      className="px-8 py-4 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white font-extrabold rounded-full hover:opacity-90 transition-all hover:shadow-xl hover:scale-105 active:scale-95"
                      style={{
                        boxShadow: '0 10px 30px rgba(239, 142, 129, 0.3)'
                      }}
                    >
                      Start This Track
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 mb-20 text-center">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-12 backdrop-blur-sm text-center">
            <h2 className="text-3xl font-extrabold text-white mb-4 text-center">Ready to Start Your Marketing Journey?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto text-lg text-center">
              Join thousands of small business owners who are taking control of their marketing with MomentumDIY.
            </p>
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="px-8 py-4 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white font-extrabold rounded-full hover:opacity-90 transition-all hover:shadow-xl hover:scale-105 active:scale-95"
              style={{
                boxShadow: '0 10px 30px rgba(239, 142, 129, 0.3)'
              }}
            >
              Start Free — No Credit Card Required
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

