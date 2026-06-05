import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useMarketing } from '../contexts/MarketingContext';
import Breadcrumbs from './Breadcrumbs';

interface PersonalizedDashboardProps {
  children: React.ReactNode;
}

export default function PersonalizedDashboard({ children }: PersonalizedDashboardProps) {
  const { onboardingData, loading } = useOnboarding();
  const { activeGoal } = useMarketing();
  const location = useLocation();
  
  // Only show personalized containers on the dashboard page
  const isDashboard = location.pathname === '/app' || location.pathname === '/app/';


  // Personalize the dashboard based on onboarding data
  const personalizedGreeting = onboardingData 
    ? `Welcome back, ${onboardingData.businessName}!`
    : 'Welcome to MomentumDIY!';
  const businessContext = onboardingData 
    ? `${onboardingData.businessType} in ${onboardingData.industry}`
    : 'Let\'s get you set up';
  const timeContext = onboardingData 
    ? `You have ${onboardingData.timeAvailable} available for marketing`
    : 'Start by choosing a marketing track';

  return (
    <div className="personalized-dashboard">
      {/* Personalized header - only on dashboard */}
      {isDashboard && !loading && (
        <div className="mb-6 p-4 bg-gradient-to-r from-[#EF8E81]/10 to-[#D4AF37]/10 rounded-lg border border-[#EF8E81]/20">
          <h1 className="text-2xl font-bold text-[#FFF1E7] mb-2">
            {personalizedGreeting}
          </h1>
          <p className="text-[#FFF1E7]/80 mb-1">
            {businessContext}
          </p>
          {onboardingData && (
            <p className="text-[#FFF1E7]/60 text-sm">
              {timeContext}
            </p>
          )}
        </div>
      )}

      {/* Your active track info - only on dashboard */}
      {isDashboard && !loading && activeGoal && (
        <div className="mb-6 p-4 bg-[#2A2438] rounded-lg border border-[#EF8E81]/30">
          <h2 className="text-lg font-semibold text-[#FFF1E7] mb-2">
            Your Marketing Track
          </h2>
          <p className="text-[#FFF1E7]/80">
            {activeGoal.title}
          </p>
          <p className="text-[#FFF1E7]/60 text-sm mt-1">
            Week {activeGoal.currentWeek} of {activeGoal.duration} • {activeGoal.progress || 0}% complete
          </p>
        </div>
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Main dashboard content */}
      {children}
    </div>
  );
}
