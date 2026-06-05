import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { getPublishedTracks, activateTrack } from '../services/marketingService';
import { useMarketing } from '../contexts/MarketingContext';
import { BRANDING } from '../config/branding';
import { logger } from '../utils/logger';
import CompletionConfetti from './CompletionConfetti';
import FormStepIndicator from './FormStepIndicator';

// Types for onboarding data
export interface OnboardingData {
  // Phase 1: Business Setup
  businessName: string;
  businessType: string;
  industry: string;
  businessStage: string;
  location: string; // NEW: City, State
  primaryGoal: string;
  biggestChallenge: string[];
  currentActivities: string[];
  timeAvailable: string;
  
  // Phase 2: Quiz Results
  quizAnswers: Record<string, string>;
  recommendedTrack: string;
  
  // Phase 3: Track Setup
  selectedTrack: string;
  startDate: string;
  notificationPreferences: string[];
  checkInDay: string;
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onComplete, onSkip }) => {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { refreshActiveGoal } = useMarketing();
  const [currentStep, setCurrentStep] = useState(0);
  const [availableTracks, setAvailableTracks] = useState<any[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedTrackForPreview, setSelectedTrackForPreview] = useState<any>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessName: '',
    businessType: '',
    industry: '',
    businessStage: '',
    location: '', // NEW
    primaryGoal: '',
    biggestChallenge: [],
    currentActivities: [],
    timeAvailable: '',
    quizAnswers: {},
    recommendedTrack: '',
    selectedTrack: '',
    startDate: new Date().toISOString().split('T')[0],
    notificationPreferences: [],
    checkInDay: 'monday'
  });

  // Load available tracks when component mounts
  useEffect(() => {
    if (isOpen) {
      loadAvailableTracks();
    }
  }, [isOpen]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the modal after a short delay to ensure it's rendered
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
    } else {
      // Return focus to the previously focused element when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }

    return () => {
      // Cleanup focus when component unmounts
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Keyboard event handling for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onSkip();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onSkip]);

  const loadAvailableTracks = async () => {
    setLoadingTracks(true);
    try {
      logger.debug('Loading available tracks for onboarding');
      const response = await getPublishedTracks();
      logger.debug('Published tracks response', { success: response.success, tracksCount: response.data?.length });
      if (response.success && response.data) {
        logger.info('Tracks loaded for onboarding', { count: response.data.length });
        setAvailableTracks(response.data);
      } else {
        logger.warn('No tracks data available', { response });
      }
    } catch (error) {
      logger.error('Error loading tracks for onboarding', error);
    } finally {
      setLoadingTracks(false);
    }
  };

  const totalSteps = 8; // Total steps across all phases

  // Calculate estimated time remaining (2-3 minutes per step)
  const getEstimatedTimeRemaining = () => {
    const stepsRemaining = totalSteps - (currentStep + 1);
    const minutesPerStep = 2;
    const totalMinutes = stepsRemaining * minutesPerStep;
    
    if (totalMinutes < 1) return 'Less than 1 minute';
    if (totalMinutes === 1) return 'About 1 minute';
    return `About ${totalMinutes} minutes`;
  };

  // Phase steps are handled by step numbers

  const getCurrentPhase = () => {
    if (currentStep < 4) return 'business-setup';
    if (currentStep < 7) return 'quiz';
    return 'track-setup';
  };

  const getStepTitle = () => {
    const phase = getCurrentPhase();
    
    switch (phase) {
      case 'business-setup':
        switch (currentStep) {
          case 0: return `Welcome to ${BRANDING.name}!`;
          case 1: return 'Tell us about your business';
          case 2: return 'What are your goals?';
          case 3: return 'Current marketing status';
          default: return 'Business Setup';
        }
      case 'quiz':
        const quizStep = currentStep - 4;
        return `Marketing Quiz - Question ${quizStep + 1} of 3`;
      case 'track-setup':
        const trackStep = currentStep - 7;
        switch (trackStep) {
          case 0: return 'Your recommended track';
          case 1: return 'Almost ready!';
          default: return 'Track Setup';
        }
      default:
        return 'Onboarding';
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Map business type to category for Business Profile
      const businessCategoryMap: Record<string, string> = {
        'retail-business': 'Retail',
        'e-commerce': 'E-commerce',
        'service-business': 'Service',
        'professional-services': 'Professional Services',
        'consultant-freelancer': 'Consulting',
        'personal-services': 'Personal Services',
        'trade-craft': 'Trade/Craft',
        'manufacturing': 'Manufacturing',
        'nonprofit': 'Nonprofit',
        'agency': 'Agency',
        'franchise': 'Franchise',
        'cooperative': 'Cooperative',
        'partnership': 'Partnership',
        'corporation': 'Corporation'
      };

      // Derive marketing channels from current activities
      const channelMap: Record<string, string> = {
        'social-media-posting': 'Social Media',
        'email-marketing': 'Email',
        'content-creation': 'Content Marketing',
        'website-blog': 'SEO',
        'paid-ads': 'Paid Advertising',
        'networking-events': 'Networking',
        'local-partnerships': 'Partnerships'
      };
      const marketingChannels = onboardingData.currentActivities
        .map(activity => channelMap[activity])
        .filter(Boolean);

      // Generate business bio from collected data
      const businessBio = `${onboardingData.businessName} is a ${onboardingData.businessStage} ${onboardingData.businessType} in the ${onboardingData.industry} industry, focused on ${onboardingData.primaryGoal.replace(/-/g, ' ')}.`;

      // Save onboarding data to individual profile columns + enhanced Business Profile fields
      await apiService.updateProfile({
        onboarding_completed: true,
        business_name: onboardingData.businessName,
        business_type: onboardingData.businessType,
        business_category: businessCategoryMap[onboardingData.businessType] || onboardingData.businessType,
        industry: onboardingData.industry,
        business_stage: onboardingData.businessStage,
        location: onboardingData.location,
        business_bio: businessBio,
        primary_goal: onboardingData.primaryGoal,
        primary_marketing_goal: onboardingData.primaryGoal.replace(/-/g, ' '),
        biggest_challenge: onboardingData.biggestChallenge,
        current_activities: onboardingData.currentActivities,
        marketing_channels: marketingChannels,
        time_available: onboardingData.timeAvailable,
        quiz_answers: onboardingData.quizAnswers,
        selected_track: onboardingData.selectedTrack,
        start_date: onboardingData.startDate,
        notification_preferences: onboardingData.notificationPreferences,
        check_in_day: onboardingData.checkInDay
      });
      
      logger.info('Onboarding data saved to profile');
      
      // Activate the selected track
      if (onboardingData.selectedTrack) {
        logger.info('Activating selected track', { trackId: onboardingData.selectedTrack });
        const trackResponse = await activateTrack(onboardingData.selectedTrack);
        
        if (trackResponse.success) {
          logger.info('Track activated successfully', { trackId: onboardingData.selectedTrack });
        } else {
          logger.error('Failed to activate track', { trackId: onboardingData.selectedTrack, error: trackResponse.error });
        }
      }
      
      // Refresh marketing context to load the new track
      logger.debug('Refreshing marketing data after onboarding');
      await refreshActiveGoal();
      logger.debug('Marketing data refreshed');
      
      // Show success celebration screen
      setShowSuccess(true);
      
      // After showing success, complete onboarding and navigate
      setTimeout(() => {
        logger.info('Onboarding completed successfully');
        onComplete(onboardingData);
        
        // Navigate to marketing track page to see the new track
        setTimeout(() => {
          navigate('/app/marketing-track');
        }, 500);
      }, 3000); // Show success screen for 3 seconds
      
    } catch (error) {
      logger.error('Error completing onboarding', error);
      // Still complete onboarding even if API calls fail
      onComplete(onboardingData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    const phase = getCurrentPhase();
    
    switch (phase) {
      case 'business-setup':
        switch (currentStep) {
          case 0: return true; // Welcome step
          case 1: return onboardingData.businessName && onboardingData.businessType && onboardingData.industry && onboardingData.location && onboardingData.businessStage;
          case 2: return onboardingData.primaryGoal && onboardingData.biggestChallenge.length > 0;
          case 3: return onboardingData.currentActivities.length > 0 && onboardingData.timeAvailable;
          default: return false;
        }
      case 'quiz':
        const quizStep = currentStep - 4;
        return Object.keys(onboardingData.quizAnswers).length > quizStep;
      case 'track-setup':
        const trackStep = currentStep - 7;
        switch (trackStep) {
          case 0: return onboardingData.selectedTrack;
          case 1: return onboardingData.notificationPreferences.length > 0;
          default: return false;
        }
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-4 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      aria-describedby="onboarding-modal-description"
    >
      <div
        ref={modalRef}
        className="bg-[#1B1628] border border-[#EF8E81]/30 rounded-2xl p-4 sm:p-6 md:p-8 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        role="document"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 id="onboarding-modal-title" className="text-2xl font-bold text-[#FFF1E7] mb-2">
              {getStepTitle()}
            </h1>
            <p id="onboarding-modal-description" className="text-[#FFF1E7]/70 mb-4">
              Complete the onboarding process to set up your MomentumDIY account and get started with your marketing journey.
            </p>
          </div>
          <button
            onClick={() => setShowSkipConfirm(true)}
            className="text-[#FFF1E7]/50 hover:text-[#FFF1E7] transition-colors text-sm"
          >
            Skip for now
          </button>
        </div>

        {/* Mobile Step Indicator */}
        <FormStepIndicator
          currentStep={currentStep + 1}
          totalSteps={totalSteps}
          steps={[
            'Business Info',
            'Business Details',
            'Goals',
            'Challenges',
            'Activities',
            'Quiz 1',
            'Quiz 2',
            'Track Setup'
          ]}
        />

        {/* Step Content */}
        <div className="min-h-[400px]">
          {getCurrentPhase() === 'business-setup' && (
            <BusinessSetupStep 
              step={currentStep}
              data={onboardingData}
              onUpdate={updateData}
            />
          )}
          
          {getCurrentPhase() === 'quiz' && (
            <QuizStep 
              step={currentStep - 4}
              data={onboardingData}
              onUpdate={updateData}
            />
          )}
          
          {getCurrentPhase() === 'track-setup' && (
            <TrackSetupStep 
              step={currentStep - 7}
              data={onboardingData}
              onUpdate={updateData}
              availableTracks={availableTracks}
              loadingTracks={loadingTracks}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-3 rounded-lg border border-[#EF8E81]/30 text-[#EF8E81] hover:bg-[#EF8E81]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>
          
            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="px-8 py-3 rounded-lg bg-[#EF8E81] text-white font-semibold hover:bg-[#E67E6B] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSubmitting && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSubmitting 
                ? 'Setting up your track...' 
                : currentStep === totalSteps - 1 
                  ? 'Complete Setup' 
                  : 'Next'
              }
            </button>
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1B1628] border border-[#EF8E81]/30 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-[#FFF1E7] mb-4">
              Skip Onboarding?
            </h3>
            <p className="text-[#FFF1E7]/80 mb-6">
              Setting up your profile and choosing a track now helps us personalize your experience and gets you started faster. You'll be able to start a track later, but we recommend completing this quick setup.
            </p>
            <div className="bg-[#EF8E81]/10 border border-[#EF8E81]/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-[#FFF1E7]/90 font-medium mb-2">What you'll miss:</p>
              <ul className="text-sm text-[#FFF1E7]/70 space-y-1">
                <li>• Personalized track recommendations</li>
                <li>• Pre-configured business profile</li>
                <li>• Automatic first week task setup</li>
                <li>• Optimized notification preferences</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="flex-1 px-6 py-3 rounded-lg border border-[#EF8E81]/30 text-[#EF8E81] hover:bg-[#EF8E81]/10 transition-colors"
              >
                Continue Setup
              </button>
              <button
                onClick={() => {
                  setShowSkipConfirm(false);
                  onSkip();
                }}
                className="flex-1 px-6 py-3 rounded-lg bg-[#2A2438] text-[#FFF1E7]/70 hover:text-[#FFF1E7] hover:bg-[#3A344E] transition-colors"
              >
                Skip Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Celebration Screen */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <CompletionConfetti isComplete={true} duration={3000} />
          <div className="bg-[#1B1628] border border-[#EF8E81]/30 rounded-2xl p-8 max-w-lg w-full text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <span className="text-5xl">🎉</span>
            </div>
            <h2 className="text-3xl font-bold text-[#FFF1E7] mb-4">
              You're All Set!
            </h2>
            <p className="text-lg text-[#FFF1E7]/80 mb-6">
              Your personalized marketing track is ready. We're setting up your first week of tasks now.
            </p>
            <div className="bg-[#2A2438] rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-4 text-sm text-[#FFF1E7]/70">
                <div className="flex items-center">
                  <span className="text-[#EF8E81] mr-2">✓</span>
                  <span>Track activated</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[#EF8E81] mr-2">✓</span>
                  <span>Tasks queued</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#FFF1E7]/50 animate-pulse">
              Redirecting to your track...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Business Setup Step Component
const BusinessSetupStep: React.FC<{
  step: number;
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}> = ({ step, data, onUpdate }) => {
  switch (step) {
    case 0: // Welcome
      return (
        <div className="text-center">
          <div className="w-24 h-24 bg-[#EF8E81] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-3xl font-bold text-[#FFF1E7] mb-4">
            Welcome to {BRANDING.name}!
          </h2>
          <p className="text-lg text-[#FFF1E7]/80 mb-8 max-w-2xl mx-auto">
            We're excited to help you build a marketing strategy that actually works. 
            Let's personalize your experience so you can start seeing results from day one.
          </p>
          
          <div className="bg-gradient-to-r from-[#EF8E81]/10 to-[#D4AF37]/10 border border-[#EF8E81]/30 rounded-lg p-6 max-w-2xl mx-auto mb-6">
            <h3 className="text-xl font-semibold text-[#FFF1E7] mb-4 flex items-center">
              <span className="text-2xl mr-3">🎯</span>
              What we'll set up together:
            </h3>
            <ul className="text-[#FFF1E7]/80 space-y-3 text-left">
              <li className="flex items-start">
                <span className="text-[#EF8E81] mr-3 mt-0.5">✓</span>
                <span><strong>Your business profile:</strong> We'll personalize everything based on your business type, goals, and industry</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#EF8E81] mr-3 mt-0.5">✓</span>
                <span><strong>Track recommendation:</strong> Get matched with the perfect 12-week marketing track for your goals</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#EF8E81] mr-3 mt-0.5">✓</span>
                <span><strong>First week ready:</strong> Your tasks are automatically set up so you can start immediately</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#EF8E81] mr-3 mt-0.5">✓</span>
                <span><strong>Smart notifications:</strong> Get reminders tailored to your schedule and preferences</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#2A2438] rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-6 text-sm text-[#FFF1E7]/70">
              <div className="flex items-center">
                <span className="text-[#EF8E81] mr-2">⏱️</span>
                <span>Takes about 3-5 minutes</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#EF8E81] mr-2">🎁</span>
                <span>100% personalized</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#EF8E81] mr-2">⚡</span>
                <span>Get started instantly</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 1: // Business Basics
      return (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#FFF1E7] mb-6">
            Tell us about your business
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[#FFF1E7] font-medium mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={data.businessName}
                onChange={(e) => onUpdate({ businessName: e.target.value })}
                className="w-full px-4 py-3 bg-[#2A2438] border border-[#EF8E81]/30 rounded-lg text-[#FFF1E7] focus:border-[#EF8E81] focus:outline-none"
                placeholder="e.g., Sarah's Coffee Shop"
              />
            </div>

            <div>
              <label className="block text-[#FFF1E7] font-medium mb-2">
                Business Type *
              </label>
              <select
                value={data.businessType}
                onChange={(e) => onUpdate({ businessType: e.target.value })}
                className="w-full px-4 py-3 bg-[#2A2438] border border-[#EF8E81]/30 rounded-lg text-[#FFF1E7] focus:border-[#EF8E81] focus:outline-none"
              >
                <option value="">Select your business type</option>
                <option value="retail-business">Retail Business</option>
                <option value="e-commerce">E-commerce/Online Store</option>
                <option value="service-business">Service Business</option>
                <option value="professional-services">Professional Services</option>
                <option value="consultant-freelancer">Consultant/Freelancer</option>
                <option value="personal-services">Personal Services</option>
                <option value="trade-craft">Trade/Craft Business</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="nonprofit">Nonprofit Organization</option>
                <option value="agency">Marketing/Agency</option>
                <option value="franchise">Franchise</option>
                <option value="cooperative">Cooperative</option>
                <option value="partnership">Partnership</option>
                <option value="corporation">Corporation</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[#FFF1E7] font-medium mb-2">
                Industry *
              </label>
              <select
                value={data.industry}
                onChange={(e) => onUpdate({ industry: e.target.value })}
                className="w-full px-4 py-3 bg-[#2A2438] border border-[#EF8E81]/30 rounded-lg text-[#FFF1E7] focus:border-[#EF8E81] focus:outline-none"
              >
                <option value="">Select your industry</option>
                <option value="technology">Technology & Software</option>
                <option value="healthcare">Healthcare & Medical</option>
                <option value="construction">Construction & Contracting</option>
                <option value="automotive">Automotive</option>
                <option value="real-estate">Real Estate</option>
                <option value="beauty-wellness">Beauty & Wellness</option>
                <option value="restaurant">Restaurant & Food Service</option>
                <option value="fitness">Fitness & Recreation</option>
                <option value="education">Education & Training</option>
                <option value="finance">Finance & Insurance</option>
                <option value="legal">Legal Services</option>
                <option value="hospitality">Hospitality & Tourism</option>
                <option value="entertainment">Entertainment & Events</option>
                <option value="agriculture">Agriculture & Farming</option>
                <option value="transportation">Transportation & Logistics</option>
                <option value="energy">Energy & Utilities</option>
                <option value="retail">Retail & Shopping</option>
                <option value="marketing">Marketing & Advertising</option>
                <option value="consulting">Consulting & Advisory</option>
                <option value="nonprofit">Nonprofit & Charity</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[#FFF1E7] font-medium mb-2">
                Business Location *
              </label>
              <input
                type="text"
                value={data.location}
                onChange={(e) => onUpdate({ location: e.target.value })}
                className="w-full px-4 py-3 bg-[#2A2438] border border-[#EF8E81]/30 rounded-lg text-[#FFF1E7] focus:border-[#EF8E81] focus:outline-none"
                placeholder="e.g., Boston, MA or Online Only"
              />
              <p className="text-[#FFF1E7]/60 text-sm mt-1">
                Where do you primarily operate? (City, State or "Online")
              </p>
            </div>

            <div>
              <label className="block text-[#FFF1E7] font-medium mb-2">
                Business Stage *
              </label>
              <select
                value={data.businessStage}
                onChange={(e) => onUpdate({ businessStage: e.target.value })}
                className="w-full px-4 py-3 bg-[#2A2438] border border-[#EF8E81]/30 rounded-lg text-[#FFF1E7] focus:border-[#EF8E81] focus:outline-none"
              >
                <option value="">Select your business stage</option>
                <option value="idea-stage">Idea Stage - Planning to launch</option>
                <option value="startup">Startup - Recently launched</option>
                <option value="early-stage">Early Stage - Building customer base</option>
                <option value="growth-stage">Growth Stage - Expanding operations</option>
                <option value="established">Established - Stable and profitable</option>
                <option value="mature">Mature - Well-established business</option>
                <option value="scaling">Scaling - Ready for major expansion</option>
                <option value="pivot">Pivoting - Changing direction</option>
              </select>
            </div>
          </div>
        </div>
      );

    case 2: // Goals & Challenges
      return (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#FFF1E7] mb-6">
            What are your goals?
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[#FFF1E7] font-medium mb-3">
                What's your primary business goal? *
              </label>
              <div className="space-y-3">
                {[
                  { value: 'increase-foot-traffic', label: 'Increase local foot traffic' },
                  { value: 'grow-social-media', label: 'Grow social media presence' },
                  { value: 'generate-leads', label: 'Generate more leads' },
                  { value: 'build-awareness', label: 'Build brand awareness' },
                  { value: 'increase-sales', label: 'Increase sales' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="primaryGoal"
                      value={option.value}
                      checked={data.primaryGoal === option.value}
                      onChange={(e) => onUpdate({ primaryGoal: e.target.value })}
                      className="w-4 h-4 text-[#EF8E81] bg-[#2A2438] border-[#EF8E81]/30 focus:ring-[#EF8E81]"
                    />
                    <span className="text-[#FFF1E7]">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#FFF1E7] font-medium mb-3">
                What's your biggest marketing challenge? (Select all that apply) *
              </label>
              <div className="space-y-3">
                {[
                  'don\'t-know-where-to-start',
                  'lack-of-time',
                  'no-clear-strategy',
                  'inconsistent-posting',
                  'low-engagement',
                  'measuring-results',
                  'creating-content',
                  'understanding-audience'
                ].map((challenge) => (
                  <label key={challenge} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.biggestChallenge.includes(challenge)}
                      onChange={(e) => {
                        const challenges = e.target.checked
                          ? [...data.biggestChallenge, challenge]
                          : data.biggestChallenge.filter(c => c !== challenge);
                        onUpdate({ biggestChallenge: challenges });
                      }}
                      className="w-4 h-4 text-[#EF8E81] bg-[#2A2438] border-[#EF8E81]/30 rounded focus:ring-[#EF8E81]"
                    />
                    <span className="text-[#FFF1E7] capitalize">
                      {challenge.replace(/-/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 3: // Current Status
      return (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#FFF1E7] mb-6">
            Current marketing status
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[#FFF1E7] font-medium mb-3">
                What marketing activities are you currently doing? (Select all that apply) *
              </label>
              <div className="space-y-3">
                {[
                  'social-media-posting',
                  'google-my-business',
                  'email-marketing',
                  'paid-advertising',
                  'content-creation',
                  'website-blog',
                  'networking-events',
                  'none-of-the-above'
                ].map((activity) => (
                  <label key={activity} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.currentActivities.includes(activity)}
                      onChange={(e) => {
                        const activities = e.target.checked
                          ? [...data.currentActivities, activity]
                          : data.currentActivities.filter(a => a !== activity);
                        onUpdate({ currentActivities: activities });
                      }}
                      className="w-4 h-4 text-[#EF8E81] bg-[#2A2438] border-[#EF8E81]/30 rounded focus:ring-[#EF8E81]"
                    />
                    <span className="text-[#FFF1E7] capitalize">
                      {activity.replace(/-/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#FFF1E7] font-medium mb-3">
                How much time can you dedicate to marketing per week? *
              </label>
              <div className="space-y-3">
                {[
                  { value: '1-2-hours', label: '1-2 hours' },
                  { value: '3-5-hours', label: '3-5 hours' },
                  { value: '6-10-hours', label: '6-10 hours' },
                  { value: '10-plus-hours', label: '10+ hours' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="timeAvailable"
                      value={option.value}
                      checked={data.timeAvailable === option.value}
                      onChange={(e) => onUpdate({ timeAvailable: e.target.value })}
                      className="w-4 h-4 text-[#EF8E81] bg-[#2A2438] border-[#EF8E81]/30 focus:ring-[#EF8E81]"
                    />
                    <span className="text-[#FFF1E7]">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

// Quiz Step Component
const QuizStep: React.FC<{
  step: number;
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}> = ({ step, data, onUpdate }) => {
  const quizQuestions = [
    {
      question: "What's your primary business location?",
      options: [
        { value: 'physical-only', label: 'Physical storefront/location only' },
        { value: 'online-only', label: 'Online only' },
        { value: 'both', label: 'Both physical and online' }
      ]
    },
    {
      question: "Where do most of your customers come from?",
      options: [
        { value: 'walk-ins', label: 'Walk-ins from the street' },
        { value: 'social-media', label: 'Social media' },
        { value: 'google-search', label: 'Google search' },
        { value: 'referrals', label: 'Referrals' },
        { value: 'online-ads', label: 'Online ads' }
      ]
    },
    {
      question: "What's your biggest marketing priority right now?",
      options: [
        { value: 'physical-traffic', label: 'Getting more people to visit my physical location' },
        { value: 'online-presence', label: 'Growing my online presence and followers' },
        { value: 'leads-sales', label: 'Generating more leads and sales' },
        { value: 'brand-recognition', label: 'Building brand recognition' }
      ]
    }
  ];

  const currentQuestion = quizQuestions[step];
  const questionKey = `quiz_${step + 1}`;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-[#FFF1E7] mb-6">
        {currentQuestion.question}
      </h2>
      
      <div className="space-y-4">
        {currentQuestion.options.map((option) => (
          <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-4 bg-[#2A2438] rounded-lg hover:bg-[#2A2438]/80 transition-colors">
            <input
              type="radio"
              name={questionKey}
              value={option.value}
              checked={data.quizAnswers[questionKey] === option.value}
              onChange={(e) => onUpdate({ 
                quizAnswers: { ...data.quizAnswers, [questionKey]: e.target.value }
              })}
              className="w-4 h-4 text-[#EF8E81] bg-[#2A2438] border-[#EF8E81]/30 focus:ring-[#EF8E81]"
            />
            <span className="text-[#FFF1E7]">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Track Setup Step Component
const TrackSetupStep: React.FC<{
  step: number;
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  availableTracks: any[];
  loadingTracks: boolean;
}> = ({ step, data, onUpdate, availableTracks, loadingTracks }) => {
  // Calculate recommended track based on quiz answers and user profile
  const calculateRecommendedTrack = () => {
    if (availableTracks.length === 0) return null;
    if (availableTracks.length === 1) return availableTracks[0];
    
    // Score each track based on user's profile and answers
    const scoredTracks = availableTracks.map(track => {
      let score = 0;
      const matchReasons: string[] = [];
      
      // 1. Match primary goal to track characteristics
      const goalMatches: Record<string, string[]> = {
        'increase-foot-traffic': ['local', 'foot', 'traffic', 'physical', 'store', 'location'],
        'grow-social-media': ['social', 'media', 'instagram', 'facebook', 'content', 'followers', 'engagement', 'strategy'],
        'generate-leads': ['leads', 'funnel', 'conversion', 'customers', 'sales', 'email', 'list', 'audience'],
        'build-awareness': ['brand', 'awareness', 'visibility', 'recognition', 'audience', 'email', 'list', 'community', 'connections'],
        'increase-sales': ['sales', 'revenue', 'conversion', 'customers', 'ecommerce', 'email', 'list', 'repeat', 'business']
      };
      
      const goalKeywords = goalMatches[data.primaryGoal] || [];
      const trackText = `${track.title} ${track.description} ${track.slug}`.toLowerCase();
      
      goalKeywords.forEach(keyword => {
        if (trackText.includes(keyword)) {
          score += 10;
          matchReasons.push(`Matches your goal: ${data.primaryGoal.replace(/-/g, ' ')}`);
        }
      });
      
      // 2. Match quiz answer 1: Business location type
      const locationAnswer = data.quizAnswers['quiz_1'];
      if (locationAnswer === 'physical-only' && (trackText.includes('local') || trackText.includes('foot') || trackText.includes('physical'))) {
        score += 15;
        matchReasons.push('Perfect for physical location businesses');
      } else if (locationAnswer === 'online-only' && (trackText.includes('social') || trackText.includes('online') || trackText.includes('digital') || trackText.includes('email') || trackText.includes('list'))) {
        score += 15;
        matchReasons.push('Optimized for online businesses');
      } else if (locationAnswer === 'both') {
        // Both physical and online - email and social media work well for both
        if (trackText.includes('email') || trackText.includes('social') || trackText.includes('local')) {
          score += 10;
          matchReasons.push('Works for both physical and online businesses');
        } else {
          score += 5; // Any track could work
        }
      }
      
      // 3. Match quiz answer 2: Customer source
      const customerSourceAnswer = data.quizAnswers['quiz_2'];
      const sourceMatches: Record<string, string[]> = {
        'walk-ins': ['local', 'foot', 'traffic', 'location', 'physical'],
        'social-media': ['social', 'media', 'instagram', 'facebook', 'content', 'engagement', 'strategy', 'followers'],
        'google-search': ['seo', 'google', 'search', 'local', 'online', 'email', 'list'],
        'referrals': ['referral', 'word-of-mouth', 'customers', 'community', 'email', 'list', 'connections'],
        'online-ads': ['ads', 'advertising', 'paid', 'digital', 'marketing', 'email', 'list', 'leads']
      };
      
      const sourceKeywords = sourceMatches[customerSourceAnswer] || [];
      sourceKeywords.forEach(keyword => {
        if (trackText.includes(keyword)) {
          score += 8;
          matchReasons.push('Aligns with how your customers find you');
        }
      });
      
      // 4. Match quiz answer 3: Marketing priority (highest weight)
      const priorityAnswer = data.quizAnswers['quiz_3'];
      const priorityMatches: Record<string, string[]> = {
        'physical-traffic': ['local', 'foot', 'traffic', 'store', 'location', 'physical'],
        'online-presence': ['social', 'media', 'online', 'digital', 'presence', 'followers', 'engagement', 'strategy', 'email', 'list'],
        'leads-sales': ['leads', 'sales', 'conversion', 'customers', 'revenue', 'email', 'list', 'repeat', 'business'],
        'brand-recognition': ['brand', 'awareness', 'recognition', 'visibility', 'audience', 'email', 'list', 'community', 'connections']
      };
      
      const priorityKeywords = priorityMatches[priorityAnswer] || [];
      priorityKeywords.forEach(keyword => {
        if (trackText.includes(keyword)) {
          score += 20; // Highest weight for marketing priority
          matchReasons.push('Directly addresses your top priority');
        }
      });
      
      // 5. Match industry tags
      if (track.industry_tags && track.industry_tags.length > 0) {
        const userIndustry = data.industry.toLowerCase();
        const trackIndustries = track.industry_tags.map((tag: string) => tag.toLowerCase());
        
        if (trackIndustries.includes(userIndustry) || trackIndustries.some((tag: string) => userIndustry.includes(tag))) {
          score += 12;
          matchReasons.push(`Tailored for ${data.industry} industry`);
        }
      }
      
      // 6. Match business stage and time available
      const businessStage = data.businessStage;
      if ((businessStage === 'startup' || businessStage === 'early-stage') && track.duration_weeks <= 12) {
        score += 5;
        matchReasons.push('Right pace for your business stage');
      }
      
      const timeAvailable = data.timeAvailable;
      if (timeAvailable === '1-2-hours' && track.duration_weeks <= 8) {
        score += 5;
        matchReasons.push('Fits your available time commitment');
      } else if (timeAvailable === '10-plus-hours' && track.duration_weeks >= 12) {
        score += 5;
        matchReasons.push('Makes use of your available time');
      }
      
      // 6.5. Match current activities (boost if already doing related activities)
      data.currentActivities.forEach(activity => {
        const activityMatches: Record<string, string[]> = {
          'email-marketing': ['email', 'list', 'audience', 'subscribers'],
          'social-media-posting': ['social', 'media', 'engagement', 'strategy', 'content', 'followers'],
          'google-my-business': ['local', 'foot', 'traffic', 'location', 'physical'],
          'content-creation': ['content', 'social', 'media', 'email', 'strategy'],
          'website-blog': ['email', 'list', 'audience', 'social', 'content'],
          'paid-advertising': ['email', 'list', 'leads', 'sales', 'conversion'],
          'networking-events': ['email', 'list', 'community', 'connections', 'referrals']
        };
        
        const keywords = activityMatches[activity] || [];
        keywords.forEach(keyword => {
          if (trackText.includes(keyword)) {
            score += 8;
            matchReasons.push(`Builds on your ${activity.replace(/-/g, ' ')} efforts`);
          }
        });
      });
      
      // 7. Match biggest challenges
      data.biggestChallenge.forEach(challenge => {
        const challengeKeywords: Record<string, string[]> = {
          'don\'t-know-where-to-start': ['beginner', 'start', 'basics', 'foundation', 'step-by-step'],
          'lack-of-time': ['quick', 'efficient', 'time-saving', 'simple'],
          'no-clear-strategy': ['strategy', 'plan', 'roadmap', 'structured'],
          'inconsistent-posting': ['consistent', 'schedule', 'calendar', 'routine', 'email', 'batching'],
          'low-engagement': ['engagement', 'audience', 'community', 'interaction', 'social', 'media', 'email'],
          'measuring-results': ['analytics', 'tracking', 'metrics', 'results'],
          'creating-content': ['content', 'creation', 'ideas', 'templates', 'email', 'social'],
          'understanding-audience': ['audience', 'targeting', 'customer', 'persona', 'email', 'list', 'community']
        };
        
        const keywords = challengeKeywords[challenge] || [];
        keywords.forEach(keyword => {
          if (trackText.includes(keyword)) {
            score += 6;
            matchReasons.push(`Helps with: ${challenge.replace(/-/g, ' ')}`);
          }
        });
      });
      
      return {
        track,
        score,
        matchReasons: [...new Set(matchReasons)] // Remove duplicates
      };
    });
    
    // Sort by score (highest first) and return the top match
    scoredTracks.sort((a, b) => b.score - a.score);
    
    logger.info('Track matching completed', {
      topTrack: scoredTracks[0]?.track.title,
      topScore: scoredTracks[0]?.score,
      matchReasons: scoredTracks[0]?.matchReasons,
      allScores: scoredTracks.map(st => ({ title: st.track.title, score: st.score }))
    });
    
    // Store the match reasons in the recommended track object
    const topMatch = scoredTracks[0];
    if (topMatch) {
      return {
        ...topMatch.track,
        matchReasons: topMatch.matchReasons,
        matchScore: topMatch.score
      };
    }
    
    return null;
  };

  const recommendedTrack = calculateRecommendedTrack();

  // Auto-select recommended track when it's calculated (but allow user to override)
  React.useEffect(() => {
    if (recommendedTrack && !data.selectedTrack && step === 0) {
      onUpdate({ 
        selectedTrack: recommendedTrack.id,
        recommendedTrack: recommendedTrack.id 
      });
      logger.info('Auto-selected recommended track', { 
        trackId: recommendedTrack.id, 
        trackTitle: recommendedTrack.title,
        matchScore: recommendedTrack.matchScore 
      });
    }
  }, [recommendedTrack, data.selectedTrack, step]);

  switch (step) {
    case 0: // Track Selection
      if (loadingTracks) {
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF8E81] mb-4"></div>
            <p className="text-[#FFF1E7]">Loading available tracks...</p>
          </div>
        );
      }

      if (availableTracks.length === 0) {
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-[#FFF1E7] mb-6">
              Choose Your Marketing Track
            </h2>
            <div className="bg-[#EF8E81]/10 border border-[#EF8E81]/30 rounded-xl p-6">
              <p className="text-[#FFF1E7]">
                No marketing tracks are currently available. Please contact support or try again later.
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#FFF1E7] mb-6">
            Choose Your Marketing Track
          </h2>
          
          {recommendedTrack && (
            <div className="bg-[#EF8E81]/10 border border-[#EF8E81]/30 rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#EF8E81] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-[#FFF1E7]">
                      Recommended: {recommendedTrack.title}
                    </h3>
                    {recommendedTrack.matchScore && (
                      <span className="px-2 py-1 bg-[#EF8E81] text-white text-xs font-semibold rounded-full">
                        {recommendedTrack.matchScore > 50 ? 'Perfect Match' : 'Great Match'}
                      </span>
                    )}
                  </div>
                  <p className="text-[#FFF1E7]/80 mb-3">
                    {recommendedTrack.description}
                  </p>
                  {recommendedTrack.matchReasons && recommendedTrack.matchReasons.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-[#FFF1E7] mb-2">Why this track is perfect for you:</p>
                      <ul className="space-y-1">
                        {recommendedTrack.matchReasons.slice(0, 4).map((reason: string, index: number) => (
                          <li key={index} className="text-sm text-[#FFF1E7]/70 flex items-start">
                            <span className="text-[#EF8E81] mr-2">✓</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-[#FFF1E7]/70">
                    <span>⏱️ {recommendedTrack.duration_weeks} weeks</span>
                    <span>🎯 {recommendedTrack.industry_tags?.join(', ') || 'Marketing strategy'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#FFF1E7] mb-4">Available Tracks:</h3>
            {availableTracks.map((track) => (
              <div key={track.id} className="bg-[#2A2438] rounded-lg hover:bg-[#2A2438]/80 transition-colors border border-transparent hover:border-[#EF8E81]/30">
                <label className="flex items-start space-x-3 cursor-pointer p-4">
                  <input
                    type="radio"
                    name="selectedTrack"
                    value={track.id}
                    checked={data.selectedTrack === track.id}
                    onChange={(e) => onUpdate({ selectedTrack: e.target.value })}
                    className="w-4 h-4 text-[#EF8E81] bg-[#2A2438] border-[#EF8E81]/30 focus:ring-[#EF8E81] mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="text-[#FFF1E7] font-medium block mb-1">{track.title}</span>
                        <span className="text-[#FFF1E7]/70 text-sm line-clamp-2">{track.description}</span>
                        <div className="flex items-center space-x-4 text-xs text-[#FFF1E7]/50 mt-2">
                          <span>⏱️ {track.duration_weeks} weeks</span>
                          {track.industry_tags && track.industry_tags.length > 0 && (
                            <span>🏷️ {track.industry_tags.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
                <div className="px-4 pb-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedTrackForPreview(track);
                    }}
                    className="text-xs text-[#EF8E81] hover:text-[#E67A6E] transition-colors flex items-center"
                  >
                    <span className="mr-1">👁️</span>
                    Preview track details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Track Preview Modal */}
          {selectedTrackForPreview && (
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
              onClick={() => setSelectedTrackForPreview(null)}
            >
              <div 
                className="bg-[#1B1628] border border-[#EF8E81]/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-2xl font-bold text-[#FFF1E7]">
                    {selectedTrackForPreview.title}
                  </h3>
                  <button
                    onClick={() => setSelectedTrackForPreview(null)}
                    className="text-[#FFF1E7]/50 hover:text-[#FFF1E7] transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-[#FFF1E7]/80 mb-6 leading-relaxed">
                  {selectedTrackForPreview.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#2A2438] rounded-lg p-4">
                    <div className="text-sm text-[#FFF1E7]/60 mb-1">Duration</div>
                    <div className="text-lg font-semibold text-[#FFF1E7]">
                      {selectedTrackForPreview.duration_weeks} weeks
                    </div>
                  </div>
                  {selectedTrackForPreview.industry_tags && selectedTrackForPreview.industry_tags.length > 0 && (
                    <div className="bg-[#2A2438] rounded-lg p-4">
                      <div className="text-sm text-[#FFF1E7]/60 mb-1">Best For</div>
                      <div className="text-lg font-semibold text-[#FFF1E7]">
                        {selectedTrackForPreview.industry_tags.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onUpdate({ selectedTrack: selectedTrackForPreview.id });
                      setSelectedTrackForPreview(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-lg bg-[#EF8E81] text-white font-semibold hover:bg-[#E67A6E] transition-colors"
                  >
                    Select This Track
                  </button>
                  <button
                    onClick={() => setSelectedTrackForPreview(null)}
                    className="px-6 py-3 rounded-lg border border-[#EF8E81]/30 text-[#EF8E81] hover:bg-[#EF8E81]/10 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case 1: // Success Setup
      return (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#FFF1E7] mb-6">
            Almost ready!
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[#FFF1E7] font-medium mb-3">
                How would you like to receive notifications? (Select all that apply) *
              </label>
              <div className="space-y-3">
                {[
                  { value: 'email', label: 'Email notifications' },
                  { value: 'in-app', label: 'In-app notifications' },
                  { value: 'both', label: 'Both email and in-app' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.notificationPreferences.includes(option.value)}
                      onChange={(e) => {
                        const preferences = e.target.checked
                          ? [...data.notificationPreferences, option.value]
                          : data.notificationPreferences.filter(p => p !== option.value);
                        onUpdate({ notificationPreferences: preferences });
                      }}
                      className="w-4 h-4 text-[#EF8E81] bg-[#2A2438] border-[#EF8E81]/30 rounded focus:ring-[#EF8E81]"
                    />
                    <span className="text-[#FFF1E7]">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#FFF1E7] font-medium mb-3">
                What day would you like to check in on your progress?
              </label>
              <select
                value={data.checkInDay}
                onChange={(e) => onUpdate({ checkInDay: e.target.value })}
                className="w-full px-4 py-3 bg-[#2A2438] border border-[#EF8E81]/30 rounded-lg text-[#FFF1E7] focus:border-[#EF8E81] focus:outline-none"
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>

            <div className="bg-[#2A2438] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#FFF1E7] mb-3">
                🎉 You're all set!
              </h3>
              <p className="text-[#FFF1E7]/80 mb-4">
                We'll create your personalized marketing track and set up your first week of tasks. 
                You'll start seeing results within your first week!
              </p>
              <div className="text-sm text-[#FFF1E7]/70">
                <p>✓ Your {availableTracks.find(t => t.id === data.selectedTrack)?.title || 'marketing'} track is ready</p>
                <p>✓ First week's tasks are queued up</p>
                <p>✓ Progress tracking is enabled</p>
                <p>✓ Notifications are configured</p>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default OnboardingWizard;