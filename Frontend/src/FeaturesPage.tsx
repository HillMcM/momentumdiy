import { useNavigate } from 'react-router-dom';

export default function FeaturesPage() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Learning & Education',
      description: 'Structured learning paths that fit your busy schedule and guide you step-by-step to marketing success.',
      sectionTitle: '90-Day Structured Tracks',
      sectionDescription: 'No more wondering what to do next. Choose from Foundation, Growth, or Advanced Marketing tracks—each with a clear 12-week roadmap tailored to your business goals.',
      bullets: [
        'Foundation Track: Build your marketing basics',
        'Growth Track: Scale what\'s working',
        'Advanced Track: Master sophisticated strategies',
        'Switch tracks anytime as your needs evolve'
      ],
      imageSrc: '/assets/marketing_track_feature_gif.gif',
      imageAlt: 'Marketing Track Interface',
      callouts: [
        {
          icon: '📹',
          title: 'Step-by-Step Lessons',
          description: '15-45 minute lessons designed for busy owners. Read, learn, and implement—all in the same day.'
        },
        {
          icon: '📄',
          title: 'Templates & Worksheets',
          description: 'Access proven templates and worksheets for social posts, email campaigns, content calendars, and more.'
        },
        {
          icon: '✓',
          title: 'Progress Tracking',
          description: 'See your completion status at a glance. Earn badges as you hit milestones and build momentum.'
        }
      ]
    },
    {
      title: 'AI-Powered Assistance',
      description: 'Your personal marketing coach, available 24/7 to answer questions and help you stay on track.',
      sectionTitle: 'AI Marketing Assistant',
      sectionDescription: 'Get instant answers and guidance powered by Claude Sonnet 4.5, trained on your business context.',
      bullets: [
        'Context-aware responses about your marketing',
        'Help with task execution and strategy questions',
        'Available on every page via floating assistant',
        'Understands your active track and business type',
        'Monthly usage limits to keep costs fair'
      ],
      imageSrc: '/assets/claude_ai_marketing_assistant_feature.png',
      imageAlt: 'AI Marketing Assistant Interface',
      callouts: [
        {
          icon: '💬',
          title: 'Conversational Interface',
          description: 'Ask questions naturally and get detailed, helpful responses tailored to your specific marketing situation.'
        },
        {
          icon: '🧠',
          title: 'Context-Aware Intelligence',
          description: 'The assistant remembers your business type, active track, and current tasks to provide relevant guidance.'
        },
        {
          icon: '⚡',
          title: 'Instant Answers',
          description: 'Get help immediately when you\'re stuck on a task or need clarification on marketing concepts.'
        }
      ]
    },
    {
      title: 'Progress Tracking',
      description: 'See your completion status at a glance. Earn badges as you hit milestones and build momentum.',
      sectionTitle: 'Task Tracker',
      sectionDescription: 'Simple Kanban board to organize your marketing tasks and see progress at a glance.',
      bullets: [
        'Drag-and-drop task organization',
        'Auto-sync with your active marketing track',
        'Project grouping and filtering',
        'Task status tracking (todo, in-progress, completed)',
        'Time estimates for each task'
      ],
      imageSrc: '/assets/task_tracker_feature.png',
      imageAlt: 'Task Tracker Dashboard',
      callouts: [
        {
          icon: '📈',
          title: 'Visual Progress',
          description: 'See your marketing momentum build with clear visual indicators of completed tasks and milestones.'
        },
        {
          icon: '🎯',
          title: 'Goal Alignment',
          description: 'Every task is automatically linked to your marketing track goals, keeping you focused on what matters.'
        },
        {
          icon: '⏱️',
          title: 'Time Management',
          description: 'Plan your week with accurate time estimates for each task, so you know what you can realistically accomplish.'
        }
      ]
    },
    {
      title: 'AI Social Media Generator',
      description: 'Create stunning social media graphics in seconds with Gemini 2.5 Flash AI.',
      sectionTitle: 'Design & Content Creation',
      sectionDescription: 'Generate professional social media posts with AI-powered design tools that understand your brand.',
      bullets: [
        'Generate 2 unique design variations per post',
        'Support for all major platforms (Instagram, Facebook, Twitter, LinkedIn)',
        'Brand-aware generation with your logo and colors',
        'Lightning-fast generation (under 30 seconds)',
        'Download high-resolution images'
      ],
      imageSrc: '/assets/gemini_social_media_generator_feature.png',
      imageAlt: 'Social Media Generator Preview',
      callouts: [
        {
          icon: '🎨',
          title: 'Brand Consistency',
          description: 'Every generated post automatically uses your brand colors and logo, maintaining a cohesive visual identity.'
        },
        {
          icon: '🔄',
          title: 'Multiple Variations',
          description: 'Get two unique design options for each post, so you can choose the style that best fits your message.'
        },
        {
          icon: '📱',
          title: 'Platform Optimization',
          description: 'Designs are automatically optimized for each platform\'s specific dimensions and best practices.'
        }
      ]
    },
    {
      title: 'Templates & Worksheets',
      description: 'Download and customize proven templates for social posts, email campaigns, content calendars, and more.',
      sectionTitle: 'Asset Library',
      sectionDescription: 'Store and organize all your marketing materials in one place.',
      bullets: [
        'Upload and organize marketing assets',
        'Categorize by type and campaign',
        'Quick access from anywhere in the app',
        'Image and file storage',
        'Reusable templates and worksheets'
      ],
      imageSrc: '/assets/asset_feature.png',
      imageAlt: 'Asset Library Interface',
      callouts: [
        {
          icon: '📋',
          title: 'Ready-to-Use Templates',
          description: 'Access proven templates for social posts, email campaigns, and content calendars that you can use immediately.'
        },
        {
          icon: '🗂️',
          title: 'Smart Organization',
          description: 'Categorize and tag your assets by type, campaign, or date for easy retrieval when you need them.'
        },
        {
          icon: '☁️',
          title: 'Cloud Storage',
          description: 'All your marketing materials are safely stored in the cloud and accessible from any device.'
        }
      ]
    },
    {
      title: 'Social Strategy Hub',
      description: 'Comprehensive social media strategy planning and management for businesses focused on social growth.',
      sectionTitle: 'Strategy & Planning',
      sectionDescription: 'Build and execute a complete social media strategy tailored to your business goals.',
      bullets: [
        'Complete social media strategy builder',
        'Platform-specific recommendations',
        'Content planning and scheduling',
        'Strategy sharing and collaboration',
        'PDF export of your strategy'
      ],
      imageSrc: '/assets/dashboard_feature.png',
      imageAlt: 'Strategy Builder Interface',
      callouts: [
        {
          icon: '📐',
          title: 'Strategic Framework',
          description: 'Build a comprehensive strategy using proven frameworks that guide you through goal-setting and execution planning.'
        },
        {
          icon: '🤝',
          title: 'Share & Collaborate',
          description: 'Share your strategy with team members or advisors and collaborate on refining your approach together.'
        },
        {
          icon: '📄',
          title: 'Export & Present',
          description: 'Download your complete strategy as a professional PDF to present to stakeholders or keep as a reference.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'radial-gradient(1200px 600px at 80% 50%, #191628 0%, #65170C 65%)'
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
                className="text-white/90 hover:text-white font-semibold transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => navigate('/tracks')}
                className="text-white/80 hover:text-white transition-colors"
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

      {/* Hero Section & Features List */}
      <div className="relative w-full">
        <div className="text-center px-6 py-12 lg:py-20" style={{
          background: 'radial-gradient(1200px 600px at 20% 20%, #65170C 0%, #191628 70%)'
        }}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight px-4 py-8" style={{ 
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EF8E81] to-[#D4AF37]">Market Your Business</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            A complete toolkit designed for small business owners who want results without the complexity.
          </p>
        </div>
        <div className="space-y-0">
          {features.map((feature, idx) => {
            // Alternate between bg-fun-1 and bg-fun-2 gradient styles
            const gradientStyle = idx % 2 === 0 
              ? { background: 'radial-gradient(1200px 600px at 20% 20%, #65170C 0%, #191628 70%)' }
              : { background: 'radial-gradient(1200px 600px at 80% 50%, #191628 0%, #65170C 65%)' };
            
            return (
            <div
              key={idx}
              className="w-full py-12 lg:py-20"
              style={gradientStyle}
            >
              <div className="max-w-7xl mx-auto px-6">
                <div className="p-8 lg:p-10"
                  style={{
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease'
                  }}
                >
                  {/* Main Title */}
                  <h3 className="text-3xl lg:text-4xl font-extrabold text-white mb-6 pt-4 text-center" style={{ 
                    color: '#FFFFFF'
                  }}>{feature.title}</h3>
                  
                  {/* Description */}
                  <p className="text-white/90 mb-10 text-lg text-center max-w-3xl mx-auto">{feature.description}</p>

                  {/* Content with Image - Alternating Layout */}
                  <div className={`grid lg:grid-cols-2 gap-8 items-start ${idx % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                    {/* Text Content */}
                    <div className={idx % 2 === 1 ? 'lg:col-start-2' : ''}>
                      {/* Section Title and Description */}
                      {feature.sectionTitle && (
                        <div className="mb-6 text-left">
                          <h4 className="text-xl lg:text-2xl font-bold text-white mb-3">{feature.sectionTitle}</h4>
                          {feature.sectionDescription && (
                            <p className="text-white/80 text-base leading-relaxed mb-6">{feature.sectionDescription}</p>
                          )}
                        </div>
                      )}

                      {/* Bullet List */}
                      {feature.bullets && (
                        <ul className="space-y-3">
                          {feature.bullets.map((bullet, bulletIdx) => (
                            <li key={bulletIdx} className="flex items-start gap-3 text-base text-white/85">
                              <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Image */}
                    {feature.imageSrc && (
                      <div className={`rounded-xl bg-white/5 border border-white/10 p-3 overflow-hidden ${idx % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                        <img 
                          src={feature.imageSrc} 
                          alt={feature.imageAlt || feature.title}
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* Callout Containers - Always present */}
                  {feature.callouts && feature.callouts.length > 0 && (
                    <div className="mt-12 grid sm:grid-cols-3 gap-6">
                      {feature.callouts.map((callout, calloutIdx) => (
                        <div
                          key={calloutIdx}
                          className="rounded-xl bg-white/5 border border-white/10 p-6 hover:border-white/20 transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-2xl flex-shrink-0">{callout.icon}</div>
                            <div>
                              <h5 className="font-bold text-white mb-2">{callout.title}</h5>
                              <p className="text-white/80 text-sm leading-relaxed">{callout.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 mb-20 text-center px-6">
          <div className="max-w-7xl mx-auto rounded-2xl bg-white/5 border border-white/10 p-12 backdrop-blur-sm text-center">
            <h2 className="text-3xl font-extrabold text-white mb-4 text-center">Ready to Get Started?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto text-lg text-center">
              Join MomentumDIY today and get access to all these features. Start with a 30-day free trial—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/auth?mode=signup')}
                className="px-8 py-4 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white font-extrabold rounded-full hover:opacity-90 transition-all hover:shadow-xl hover:scale-105 active:scale-95"
                style={{
                  boxShadow: '0 10px 30px rgba(239, 142, 129, 0.3)'
                }}
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-full hover:bg-white/15 transition-all hover:shadow-lg hover:scale-105 active:scale-95 border border-white/20"
              >
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

