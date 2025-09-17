import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketing } from './contexts/MarketingContext';

interface MarketingTrackPageProps {
  // Props removed - using context instead
}

/**
 * MarketingTrackPage now acts as a router that redirects to the appropriate track
 * based on the active marketing goal. This ensures users always see the correct
 * track UI for their active goal.
 */
export default function MarketingTrackPage(_props: MarketingTrackPageProps) {
  const { activeGoal, isLoading } = useMarketing();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    
    if (!activeGoal) {
      // No active goal - redirect to track picker
      navigate('/track-picker', { replace: true });
      return;
    }

    // Redirect to the specific track route based on the active goal
    const title = activeGoal.title.toLowerCase();
    if (title.includes('social media') || title.includes('improve social media')) {
      navigate('/app/marketing-track/social-media-strategy', { replace: true });
    } else if (title.includes('foot traffic') || title.includes('local foot traffic')) {
      navigate('/app/marketing-track/local-foot-traffic', { replace: true });
    } else {
      // Unknown track - redirect to track picker
      navigate('/track-picker', { replace: true });
    }
  }, [activeGoal, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent text-white p-6" style={{ background: 'transparent !important' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF8E81] mb-4"></div>
            <p className="text-gray-400">Loading your marketing track...</p>
          </div>
        </div>
      </div>
    );
  }

  // This component now just handles routing - the actual track display is handled by the specific track components
  return (
    <div className="min-h-screen bg-transparent text-white p-6" style={{ background: 'transparent !important' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF8E81] mb-4"></div>
          <p className="text-gray-400">Redirecting to your marketing track...</p>
        </div>
      </div>
    </div>
  );
}