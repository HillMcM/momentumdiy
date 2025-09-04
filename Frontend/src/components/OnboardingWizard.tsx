import React, { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { supabase } from '../lib/supabase';

// Types for onboarding data
interface OnboardingData {
  // Business basics
  businessName: string;
  businessType: 'local' | 'ecommerce' | 'service' | 'other';
  industry: string;
  businessStage: 'starting' | 'growing' | 'established' | 'scaling';

  // Goals & challenges
  primaryGoal: 'foot-traffic' | 'social-media' | 'leads' | 'brand-awareness' | 'other';
  goalDescription?: string;
  biggestChallenges: string[];
  otherChallenge?: string;

  // Current marketing status
  currentActivities: string[];
  timeAvailable: '1-2' | '3-5' | '6-10' | '10+';

  // Quiz responses
  quizResponses: {
    primaryLocation: 'physical' | 'online' | 'both';
    customerSource: string[];
    biggestPriority: string;
    socialMediaStatus: string;
    biggestChallenge: string;
    learningStyle: string;
    idealOutcome: string;
  };

  // Track recommendation
  recommendedTrack: string | null;
  selectedTrack: string | null;

  // Success setup
  notificationPreferences: 'email' | 'in-app' | 'both';
  weeklyCheckInDay: string;
  startDate: string;
}

// Quiz questions data
const quizQuestions = [
  {
    id: 'primaryLocation',
    question: "What's your primary business location?",
    options: [
      { value: 'physical', label: 'Physical storefront/location', description: 'Customers visit you in person' },
      { value: 'online', label: 'Online only', description: 'All business happens online' },
      { value: 'both', label: 'Both physical and online', description: 'Hybrid business model' }
    ]
  },
  {
    id: 'customerSource',
    question: 'Where do most of your customers come from?',
    options: [
      { value: 'walk-ins', label: 'Walk-ins from the street', description: 'People discover you locally' },
      { value: 'social-media', label: 'Social media', description: 'Online followers and shares' },
      { value: 'google-search', label: 'Google search', description: 'Search engine results' },
      { value: 'referrals', label: 'Referrals', description: 'Word of mouth and recommendations' },
      { value: 'ads', label: 'Online ads', description: 'Paid advertising' }
    ],
    multiple: true
  },
  {
    id: 'biggestPriority',
    question: 'What\'s your biggest marketing priority right now?',
    options: [
      { value: 'foot-traffic', label: 'Getting more people to visit my physical location', description: 'Increase in-store traffic' },
      { value: 'social-media', label: 'Growing my online presence and followers', description: 'Build social media audience' },
      { value: 'leads', label: 'Generating more leads and sales', description: 'Convert more prospects' },
      { value: 'brand-awareness', label: 'Building brand recognition', description: 'Get more people to know about me' }
    ]
  },
  {
    id: 'socialMediaStatus',
    question: 'How would you describe your current social media presence?',
    options: [
      { value: 'none', label: 'I don\'t have social media accounts', description: 'No social media presence yet' },
      { value: 'rare', label: 'I have accounts but rarely post', description: 'Accounts exist but inactive' },
      { value: 'inconsistent', label: 'I post occasionally but inconsistently', description: 'Irregular posting schedule' },
      { value: 'regular', label: 'I post regularly but want to improve', description: 'Active but seeking optimization' },
      { value: 'very-active', label: 'I\'m very active and want to optimize', description: 'Already posting regularly' }
    ]
  },
  {
    id: 'biggestChallenge',
    question: 'What\'s your biggest marketing challenge?',
    options: [
      { value: 'visibility', label: 'Getting noticed in my local area', description: 'Local discoverability issues' },
      { value: 'content', label: 'Creating engaging content', description: 'Content creation struggles' },
      { value: 'time', label: 'Finding time for marketing', description: 'Time management issues' },
      { value: 'understanding', label: 'Understanding what works', description: 'Strategy and analytics' },
      { value: 'measurement', label: 'Measuring results', description: 'Tracking marketing effectiveness' }
    ]
  },
  {
    id: 'learningStyle',
    question: 'How do you prefer to learn?',
    options: [
      { value: 'step-by-step', label: 'Step-by-step instructions', description: 'Detailed, sequential guidance' },
      { value: 'video', label: 'Video tutorials', description: 'Visual learning content' },
      { value: 'written', label: 'Written guides', description: 'Comprehensive written materials' },
      { value: 'hands-on', label: 'Hands-on practice', description: 'Learn by doing exercises' }
    ]
  },
  {
    id: 'idealOutcome',
    question: 'What\'s your ideal outcome in 90 days?',
    options: [
      { value: 'foot-traffic', label: 'More foot traffic to my business', description: 'Increase in physical visits' },
      { value: 'social-media', label: 'Stronger social media presence', description: 'Grow online following' },
      { value: 'leads', label: 'More qualified leads', description: 'Better quality prospects' },
      { value: 'brand', label: 'Better brand recognition', description: 'More people know my business' }
    ]
  }
];

// Track recommendations logic
const recommendTrack = (responses: OnboardingData['quizResponses']): string => {
  const { primaryLocation, customerSource, biggestPriority, socialMediaStatus, biggestChallenge, idealOutcome } = responses;

  let localFootTraffic = 0;
  let socialMediaStrategy = 0;

  // Location scoring
  if (primaryLocation === 'physical' || primaryLocation === 'both') {
    localFootTraffic += 2;
  }

  // Customer source scoring
  if (customerSource.includes('walk-ins')) {
    localFootTraffic += 2;
  }
  if (customerSource.includes('social-media')) {
    socialMediaStrategy += 2;
  }

  // Priority scoring
  if (biggestPriority === 'foot-traffic') {
    localFootTraffic += 3;
  }
  if (biggestPriority === 'social-media') {
    socialMediaStrategy += 3;
  }

  // Social media status scoring
  if (socialMediaStatus === 'none' || socialMediaStatus === 'rare') {
    socialMediaStrategy += 2;
  }
  if (socialMediaStatus === 'inconsistent') {
    socialMediaStrategy += 1;
  }

  // Challenge scoring
  if (biggestChallenge === 'visibility') {
    localFootTraffic += 2;
  }
  if (biggestChallenge === 'content') {
    socialMediaStrategy += 2;
  }

  // Ideal outcome scoring
  if (idealOutcome === 'foot-traffic') {
    localFootTraffic += 2;
  }
  if (idealOutcome === 'social-media') {
    socialMediaStrategy += 2;
  }

  return localFootTraffic >= socialMediaStrategy
    ? 'local-foot-traffic'
    : 'social-media-strategy';
};

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
}

export default function OnboardingWizard({ isOpen, onClose, onComplete }: OnboardingWizardProps) {
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessName: '',
    businessType: 'local',
    industry: '',
    businessStage: 'starting',
    primaryGoal: 'foot-traffic',
    goalDescription: '',
    biggestChallenges: [],
    otherChallenge: '',
    currentActivities: [],
    timeAvailable: '1-2',
    quizResponses: {
      primaryLocation: 'physical',
      customerSource: [],
      biggestPriority: 'foot-traffic',
      socialMediaStatus: 'none',
      biggestChallenge: 'visibility',
      learningStyle: 'step-by-step',
      idealOutcome: 'foot-traffic'
    },
    recommendedTrack: null,
    selectedTrack: null,
    notificationPreferences: 'both',
    weeklyCheckInDay: 'monday',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [isLoading, setIsLoading] = useState(false);

  // Calculate progress
  const totalSteps = 4; // Welcome, Quiz, Recommendation, Success
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleQuizResponse = (questionId: string, value: string | string[]) => {
    setOnboardingData(prev => ({
      ...prev,
      quizResponses: {
        ...prev.quizResponses,
        [questionId]: value
      }
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Calculate recommendation if not done yet
      if (!onboardingData.recommendedTrack) {
        const recommended = recommendTrack(onboardingData.quizResponses);
        updateOnboardingData({ recommendedTrack: recommended });
      }

      // Save onboarding data to user profile
      if (user) {
        await supabase
          .from('profiles')
          .update({
            business_name: onboardingData.businessName,
            business_category: onboardingData.businessType,
            primary_marketing_goal: onboardingData.primaryGoal,
            marketing_channels: onboardingData.currentActivities,
            skill_levels: { time_available: onboardingData.timeAvailable }
          })
          .eq('id', user.id);
      }

      onComplete(onboardingData);
      onClose();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: '#22202F',
        borderRadius: '16px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        color: '#FFF1E7'
      }}>
        {/* Header with progress */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: '#EF8E81',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.7 }}>
              Step {currentStep + 1} of {totalSteps}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFF1E7',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '2rem',
          maxHeight: 'calc(90vh - 120px)',
          overflowY: 'auto'
        }}>
          {currentStep === 0 && <WelcomeStep data={onboardingData} onUpdate={updateOnboardingData} />}
          {currentStep === 1 && <QuizStep data={onboardingData} onUpdate={handleQuizResponse} />}
          {currentStep === 2 && <RecommendationStep data={onboardingData} onUpdate={updateOnboardingData} />}
          {currentStep === 3 && <SuccessStep data={onboardingData} onUpdate={updateOnboardingData} />}
        </div>

        {/* Footer with navigation */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFF1E7',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 0 ? 0.5 : 1
            }}
          >
            Previous
          </button>

          {currentStep === totalSteps - 1 ? (
            <button
              onClick={handleComplete}
              disabled={isLoading}
              style={{
                background: '#EF8E81',
                border: 'none',
                color: '#22202F',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1.1rem'
              }}
            >
              {isLoading ? 'Setting up...' : 'Let\'s get started!'}
            </button>
          ) : (
            <button
              onClick={nextStep}
              style={{
                background: '#EF8E81',
                border: 'none',
                color: '#22202F',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Welcome Step Component
function WelcomeStep({ data, onUpdate }: {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#EF8E81' }}>
          🚀 Welcome to MomentumDIY!
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Let's personalize your marketing journey and get you set up for success
        </p>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Business Basics */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Tell us about your business</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Business Name *
              </label>
              <input
                type="text"
                value={data.businessName}
                onChange={(e) => onUpdate({ businessName: e.target.value })}
                placeholder="Your business name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFF1E7',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Business Type
              </label>
              <select
                value={data.businessType}
                onChange={(e) => onUpdate({ businessType: e.target.value as OnboardingData['businessType'] })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFF1E7',
                  fontSize: '1rem'
                }}
              >
                <option value="local">Local Business</option>
                <option value="ecommerce">E-commerce</option>
                <option value="service">Service-Based</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Industry
              </label>
              <input
                type="text"
                value={data.industry}
                onChange={(e) => onUpdate({ industry: e.target.value })}
                placeholder="e.g., Retail, Restaurant, Consulting"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFF1E7',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Business Stage
              </label>
              <select
                value={data.businessStage}
                onChange={(e) => onUpdate({ businessStage: e.target.value as OnboardingData['businessStage'] })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFF1E7',
                  fontSize: '1rem'
                }}
              >
                <option value="starting">Just Starting</option>
                <option value="growing">Growing</option>
                <option value="established">Established</option>
                <option value="scaling">Scaling</option>
              </select>
            </div>
          </div>
        </div>

        {/* Goals & Challenges */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>What are your goals?</h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Primary Business Goal
            </label>
            <select
              value={data.primaryGoal}
              onChange={(e) => onUpdate({ primaryGoal: e.target.value as OnboardingData['primaryGoal'] })}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFF1E7',
                fontSize: '1rem'
              }}
            >
              <option value="foot-traffic">Increase local foot traffic</option>
              <option value="social-media">Grow social media presence</option>
              <option value="leads">Generate more leads</option>
              <option value="brand-awareness">Build brand awareness</option>
              <option value="other">Other</option>
            </select>
          </div>

          {data.primaryGoal === 'other' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Please describe your goal
              </label>
              <textarea
                value={data.goalDescription}
                onChange={(e) => onUpdate({ goalDescription: e.target.value })}
                placeholder="Tell us about your specific goal..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFF1E7',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Biggest Marketing Challenges (select all that apply)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                { value: 'knowing-start', label: 'Don\'t know where to start' },
                { value: 'time', label: 'Lack of time' },
                { value: 'strategy', label: 'No clear strategy' },
                { value: 'consistency', label: 'Inconsistent posting' },
                { value: 'engagement', label: 'Low engagement' },
                { value: 'other', label: 'Other' }
              ].map(challenge => (
                <label key={challenge.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={data.biggestChallenges.includes(challenge.value)}
                    onChange={(e) => {
                      const newChallenges = e.target.checked
                        ? [...data.biggestChallenges, challenge.value]
                        : data.biggestChallenges.filter(c => c !== challenge.value);
                      onUpdate({ biggestChallenges: newChallenges });
                    }}
                    style={{ accentColor: '#EF8E81' }}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{challenge.label}</span>
                </label>
              ))}
            </div>

            {data.biggestChallenges.includes('other') && (
              <textarea
                value={data.otherChallenge}
                onChange={(e) => onUpdate({ otherChallenge: e.target.value })}
                placeholder="Tell us about your other challenge..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFF1E7',
                  fontSize: '1rem',
                  marginTop: '0.5rem',
                  resize: 'vertical'
                }}
              />
            )}
          </div>
        </div>

        {/* Current Marketing Status */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Current Marketing Status</h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Current Marketing Activities (select all that apply)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                'Social media posting',
                'Google My Business',
                'Email marketing',
                'Paid advertising',
                'Content creation',
                'None of the above'
              ].map(activity => (
                <label key={activity} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={data.currentActivities.includes(activity)}
                    onChange={(e) => {
                      const newActivities = e.target.checked
                        ? [...data.currentActivities, activity]
                        : data.currentActivities.filter(a => a !== activity);
                      onUpdate({ currentActivities: newActivities });
                    }}
                    style={{ accentColor: '#EF8E81' }}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{activity}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Time Available Per Week for Marketing
            </label>
            <select
              value={data.timeAvailable}
              onChange={(e) => onUpdate({ timeAvailable: e.target.value as OnboardingData['timeAvailable'] })}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFF1E7',
                fontSize: '1rem'
              }}
            >
              <option value="1-2">1-2 hours</option>
              <option value="3-5">3-5 hours</option>
              <option value="6-10">6-10 hours</option>
              <option value="10+">10+ hours</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quiz Step Component
function QuizStep({ data, onUpdate }: {
  data: OnboardingData;
  onUpdate: (questionId: string, value: string | string[]) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const question = quizQuestions[currentQuestion];

  const handleAnswer = (value: string) => {
    if (question.multiple) {
      const currentAnswers = (data.quizResponses[question.id as keyof typeof data.quizResponses] as string[]) || [];
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter(a => a !== value)
        : [...currentAnswers, value];
      onUpdate(question.id, newAnswers);
    } else {
      onUpdate(question.id, value);
      // Auto-advance for single choice questions
      if (currentQuestion < quizQuestions.length - 1) {
        setTimeout(() => setCurrentQuestion(prev => prev + 1), 500);
      }
    }
  };

  const isAnswered = question.multiple
    ? ((data.quizResponses[question.id as keyof typeof data.quizResponses] as string[]) || []).length > 0
    : data.quizResponses[question.id as keyof typeof data.quizResponses];

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Let's find your perfect marketing track! 🎯
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>
          Answer a few questions to get personalized recommendations
        </p>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>
            Question {currentQuestion + 1} of {quizQuestions.length}
          </div>
          <h2 style={{ marginTop: 0, fontSize: '1.4rem' }}>{question.question}</h2>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {question.options.map(option => {
            const isSelected = question.multiple
              ? ((data.quizResponses[question.id as keyof typeof data.quizResponses] as string[]) || []).includes(option.value)
              : data.quizResponses[question.id as keyof typeof data.quizResponses] === option.value;

            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: `2px solid ${isSelected ? '#EF8E81' : 'rgba(255, 255, 255, 0.2)'}`,
                  background: isSelected ? 'rgba(239, 142, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  color: '#FFF1E7',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  {option.label}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                  {option.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#FFF1E7',
            cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
            opacity: currentQuestion === 0 ? 0.5 : 1
          }}
        >
          Previous
        </button>

        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          {currentQuestion + 1} / {quizQuestions.length}
        </div>

        <button
          onClick={() => setCurrentQuestion(prev => Math.min(quizQuestions.length - 1, prev + 1))}
          disabled={currentQuestion === quizQuestions.length - 1 || !isAnswered}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            background: '#EF8E81',
            color: '#22202F',
            cursor: (currentQuestion === quizQuestions.length - 1 || !isAnswered) ? 'not-allowed' : 'pointer',
            opacity: (currentQuestion === quizQuestions.length - 1 || !isAnswered) ? 0.5 : 1
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Recommendation Step Component
function RecommendationStep({ data, onUpdate }: {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}) {
  const recommended = recommendTrack(data.quizResponses);

  React.useEffect(() => {
    if (!data.recommendedTrack) {
      onUpdate({ recommendedTrack: recommended });
    }
  }, [recommended, data.recommendedTrack, onUpdate]);

  const trackInfo = {
    'local-foot-traffic': {
      title: 'Local Foot Traffic Accelerator',
      description: '12-week program designed to increase foot traffic to your physical location',
      benefits: [
        'Optimize Google My Business & local listings',
        'Create compelling local content',
        'Build community engagement',
        'Track foot traffic improvements'
      ],
      icon: '🏪'
    },
    'social-media-strategy': {
      title: 'Social Media Strategy Builder',
      description: '12-week program to grow your social media presence and engagement',
      benefits: [
        'Create a content calendar',
        'Optimize posting strategy',
        'Grow your following',
        'Increase engagement rates'
      ],
      icon: '📱'
    }
  };

  const selectedTrack = data.selectedTrack || data.recommendedTrack;
  const info = trackInfo[selectedTrack as keyof typeof trackInfo];

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Your Personalized Marketing Track 🎉
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>
          Based on your answers, we recommend this track for maximum impact
        </p>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '2rem',
        borderRadius: '12px',
        border: '2px solid #EF8E81',
        marginBottom: '2rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{info.icon}</div>
          <h2 style={{ marginTop: 0, color: '#EF8E81' }}>{info.title}</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>{info.description}</p>
        </div>

        <div>
          <h3 style={{ marginTop: 0 }}>What you'll achieve:</h3>
          <ul style={{ paddingLeft: '1.5rem' }}>
            {info.benefits.map((benefit, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>{benefit}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Ready to get started?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button
            onClick={() => onUpdate({ selectedTrack: 'local-foot-traffic' })}
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: `2px solid ${data.selectedTrack === 'local-foot-traffic' ? '#EF8E81' : 'rgba(255, 255, 255, 0.2)'}`,
              background: data.selectedTrack === 'local-foot-traffic' ? 'rgba(239, 142, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              color: '#FFF1E7',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>🏪</div>
            <div style={{ fontWeight: '600' }}>Local Foot Traffic</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Focus on local visibility</div>
          </button>

          <button
            onClick={() => onUpdate({ selectedTrack: 'social-media-strategy' })}
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: `2px solid ${data.selectedTrack === 'social-media-strategy' ? '#EF8E81' : 'rgba(255, 255, 255, 0.2)'}`,
              background: data.selectedTrack === 'social-media-strategy' ? 'rgba(239, 142, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              color: '#FFF1E7',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>📱</div>
            <div style={{ fontWeight: '600' }}>Social Media Strategy</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Grow online presence</div>
          </button>
        </div>
      </div>

      <div style={{
        background: 'rgba(239, 142, 129, 0.1)',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid rgba(239, 142, 129, 0.3)'
      }}>
        <h3 style={{ marginTop: 0, color: '#EF8E81' }}>📅 Your 90-Day Journey</h3>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Week 1-2: Foundation & Setup</li>
          <li>Week 3-4: Content Creation & Posting</li>
          <li>Week 5-6: Optimization & Growth</li>
          <li>Week 7-8: Advanced Strategies</li>
          <li>Week 9-10: Scaling & Expansion</li>
          <li>Week 11-12: Mastery & Next Steps</li>
        </ul>
      </div>
    </div>
  );
}

// Success Step Component
function SuccessStep({ data, onUpdate }: {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#EF8E81' }}>
          🎯 You're All Set!
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Let's set up your success preferences and get you started
        </p>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Notification Preferences */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>📬 How would you like to receive updates?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            {[
              { value: 'email', label: 'Email', icon: '📧' },
              { value: 'in-app', label: 'In-App', icon: '💬' },
              { value: 'both', label: 'Both', icon: '📱' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => onUpdate({ notificationPreferences: option.value as OnboardingData['notificationPreferences'] })}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: `2px solid ${data.notificationPreferences === option.value ? '#EF8E81' : 'rgba(255, 255, 255, 0.2)'}`,
                  background: data.notificationPreferences === option.value ? 'rgba(239, 142, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  color: '#FFF1E7',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{option.icon}</div>
                <div style={{ fontWeight: '600' }}>{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Check-in */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>📅 When would you like your weekly check-in?</h3>
          <select
            value={data.weeklyCheckInDay}
            onChange={(e) => onUpdate({ weeklyCheckInDay: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFF1E7',
              fontSize: '1rem'
            }}
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

        {/* Start Date */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>🚀 When would you like to start?</h3>
          <input
            type="date"
            value={data.startDate}
            onChange={(e) => onUpdate({ startDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFF1E7',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Success Message */}
        <div style={{
          background: 'rgba(239, 142, 129, 0.1)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(239, 142, 129, 0.3)',
          textAlign: 'center'
        }}>
          <h3 style={{ marginTop: 0, color: '#EF8E81' }}>🎉 Ready for Takeoff!</h3>
          <p style={{ marginBottom: 0 }}>
            Your personalized marketing journey is about to begin. We'll set up your first week of tasks
            and send you regular guidance to help you succeed.
          </p>
        </div>
      </div>
    </div>
  );
}
