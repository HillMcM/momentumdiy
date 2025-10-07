import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { getPublishedTracks, activateTrack } from '../services/marketingService';

// Types for onboarding data
export interface OnboardingData {
  // Phase 1: Business Setup
  businessName: string;
  businessType: string;
  industry: string;
  businessStage: string;
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
  const [currentStep, setCurrentStep] = useState(0);
  const [availableTracks, setAvailableTracks] = useState<any[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessName: '',
    businessType: '',
    industry: '',
    businessStage: '',
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

  const loadAvailableTracks = async () => {
    setLoadingTracks(true);
    try {
      console.log('🔍 OnboardingWizard - Loading available tracks...');
      const response = await getPublishedTracks();
      console.log('🔍 OnboardingWizard - Response:', response);
      if (response.success && response.data) {
        console.log('🔍 OnboardingWizard - Setting tracks:', response.data);
        setAvailableTracks(response.data);
      } else {
        console.log('❌ OnboardingWizard - No tracks data:', response);
      }
    } catch (error) {
      console.error('Error loading tracks:', error);
    } finally {
      setLoadingTracks(false);
    }
  };

  const totalSteps = 8; // Total steps across all phases

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
          case 0: return 'Welcome to MomentumDIY!';
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
    try {
      // Save onboarding data to individual profile columns (not JSONB)
      await apiService.updateProfile({
        onboarding_completed: true,
        business_name: onboardingData.businessName,
        business_type: onboardingData.businessType,
        industry: onboardingData.industry,
        business_stage: onboardingData.businessStage,
        primary_goal: onboardingData.primaryGoal,
        biggest_challenge: onboardingData.biggestChallenge,
        current_activities: onboardingData.currentActivities,
        time_available: onboardingData.timeAvailable,
        quiz_answers: onboardingData.quizAnswers,
        selected_track: onboardingData.selectedTrack,
        start_date: onboardingData.startDate,
        notification_preferences: onboardingData.notificationPreferences,
        check_in_day: onboardingData.checkInDay
      });
      
      console.log('✅ Onboarding data saved to profile columns');
      
      // Activate the selected track
      if (onboardingData.selectedTrack) {
        console.log('🎯 Activating selected track:', onboardingData.selectedTrack);
        const trackResponse = await activateTrack(onboardingData.selectedTrack);
        
        if (trackResponse.success) {
          console.log('✅ Track activated successfully');
        } else {
          console.error('❌ Failed to activate track:', trackResponse.error);
        }
      }
      
      // Call the completion handler and close the wizard
      console.log('🔧 Calling onComplete callback...');
      onComplete(onboardingData);
      console.log('✅ onComplete callback called');
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still complete onboarding even if API calls fail
      onComplete(onboardingData);
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
          case 1: return onboardingData.businessName && onboardingData.businessType && onboardingData.industry && onboardingData.businessStage;
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1B1628] border border-[#EF8E81]/30 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#FFF1E7] mb-2">
              {getStepTitle()}
            </h1>
            <div className="flex items-center space-x-2">
              <div className="w-48 bg-[#2A2438] rounded-full h-2">
                <div 
                  className="bg-[#EF8E81] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
              <span className="text-sm text-[#FFF1E7]/70">
                {currentStep + 1} of {totalSteps}
              </span>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="text-[#FFF1E7]/50 hover:text-[#FFF1E7] transition-colors"
          >
            Skip for now
          </button>
        </div>

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
              disabled={!canProceed()}
              className="px-8 py-3 rounded-lg bg-[#EF8E81] text-white font-semibold hover:bg-[#E67E6B] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {currentStep === totalSteps - 1 ? 'Complete Setup' : 'Next'}
            </button>
        </div>
      </div>
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
            Welcome to MomentumDIY!
          </h2>
          <p className="text-lg text-[#FFF1E7]/80 mb-6 max-w-2xl mx-auto">
            We're excited to help you build a marketing strategy that actually works. 
            Let's personalize your experience so you can start seeing results from day one.
          </p>
          <div className="bg-[#2A2438] rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-[#FFF1E7] mb-3">
              What we'll set up together:
            </h3>
            <ul className="text-[#FFF1E7]/80 space-y-2 text-left">
              <li>✓ Your business profile and goals</li>
              <li>✓ A personalized marketing track recommendation</li>
              <li>✓ Your first week of actionable tasks</li>
              <li>✓ Success tracking and notifications</li>
            </ul>
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
  // Calculate recommended track based on quiz answers
  const calculateRecommendedTrack = () => {
    const answers = data.quizAnswers;
    
    // Find the best matching track from available tracks
    if (availableTracks.length === 0) return null;
    
    // For now, recommend the first available track
    // In the future, this could be more sophisticated matching based on quiz answers
    return availableTracks[0];
  };

  const recommendedTrack = calculateRecommendedTrack();

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
                <div className="w-12 h-12 bg-[#EF8E81] rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#FFF1E7] mb-2">
                    Recommended: {recommendedTrack.title}
                  </h3>
                  <p className="text-[#FFF1E7]/80 mb-3">
                    {recommendedTrack.description}
                  </p>
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
            {console.log('🔍 OnboardingWizard - Rendering tracks:', availableTracks.length, availableTracks)}
            {availableTracks.map((track) => (
              <label key={track.id} className="flex items-start space-x-3 cursor-pointer p-4 bg-[#2A2438] rounded-lg hover:bg-[#2A2438]/80 transition-colors">
                <input
                  type="radio"
                  name="selectedTrack"
                  value={track.id}
                  checked={data.selectedTrack === track.id}
                  onChange={(e) => onUpdate({ selectedTrack: e.target.value })}
                  className="w-4 h-4 text-[#EF8E81] bg-[#2A2438] border-[#EF8E81]/30 focus:ring-[#EF8E81] mt-1"
                />
                <div className="flex-1">
                  <span className="text-[#FFF1E7] font-medium block mb-1">{track.title}</span>
                  <span className="text-[#FFF1E7]/70 text-sm">{track.description}</span>
                  <div className="flex items-center space-x-4 text-xs text-[#FFF1E7]/50 mt-2">
                    <span>⏱️ {track.duration_weeks} weeks</span>
                    {track.industry_tags && track.industry_tags.length > 0 && (
                      <span>🏷️ {track.industry_tags.join(', ')}</span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
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