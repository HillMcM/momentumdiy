import React from 'react';
import { useLocation } from 'react-router-dom';
import { useOnboarding } from '../contexts/OnboardingContext';

interface PersonalizedDashboardProps {
  children: React.ReactNode;
}

export default function PersonalizedDashboard({ children }: PersonalizedDashboardProps) {
  const { onboardingData } = useOnboarding();
  const location = useLocation();
  
  // Only show personalized containers on the dashboard page
  const isDashboard = location.pathname === '/app' || location.pathname === '/app/';

  if (!onboardingData) {
    return <>{children}</>;
  }

  // Personalize the dashboard based on onboarding data
  const personalizedGreeting = `Welcome back, ${onboardingData.businessName}!`;
  const businessContext = `${onboardingData.businessType} in ${onboardingData.industry}`;
  const timeContext = `You have ${onboardingData.timeAvailable} available for marketing`;

  return (
    <div className="personalized-dashboard">
      {/* Personalized header - only on dashboard */}
      {isDashboard && (
        <div className="mb-6 p-4 bg-gradient-to-r from-[#EF8E81]/10 to-[#D4AF37]/10 rounded-lg border border-[#EF8E81]/20">
          <h1 className="text-2xl font-bold text-[#FFF1E7] mb-2">
            {personalizedGreeting}
          </h1>
          <p className="text-[#FFF1E7]/80 mb-1">
            {businessContext}
          </p>
          <p className="text-[#FFF1E7]/60 text-sm">
            {timeContext}
          </p>
        </div>
      )}

      {/* Your selected track info - only on dashboard */}
      {isDashboard && onboardingData.selectedTrack && (
        <div className="mb-6 p-4 bg-[#2A2438] rounded-lg border border-[#EF8E81]/30">
          <h2 className="text-lg font-semibold text-[#FFF1E7] mb-2">
            Your Marketing Track
          </h2>
          <p className="text-[#FFF1E7]/80">
            {onboardingData.selectedTrack === 'local-foot-traffic' 
              ? 'Increase Local Foot Traffic' 
              : 'Improve Social Media Strategy & Engagement'}
          </p>
          <p className="text-[#FFF1E7]/60 text-sm mt-1">
            Based on your goals: {onboardingData.primaryGoal}
          </p>
        </div>
      )}

      {/* Main dashboard content */}
      {children}
    </div>
  );
}
