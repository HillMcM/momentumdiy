import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/useAuth';
import { supabase } from './lib/supabase';
import { useMarketing } from './contexts/MarketingContext';
import EmailPreferences from './components/EmailPreferences';
import ProfileHeader from './components/ProfileHeader';
import ImageUploader from './components/ImageUploader';
import AIInsightsPanel from './components/AIInsightsPanel';
import ProgressTimeline from './components/ProgressTimeline';
import CompletionConfetti from './components/CompletionConfetti';
import { BACKEND_BASE_URL } from './services/api';
import { calculateMomentumScore, getMomentumFactorsFromTrackData } from './utils/momentumCalculator';
import { useIsMobile } from './hooks/useMediaQuery';

type SkillLevels = {
  social?: number;
  seo?: number;
  ads?: number;
  design?: number;
  writing?: number;
};

type WeeklyNote = {
  week: number;
  date: string;
  note: string;
};

type ProfileRecord = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  business_name?: string | null;
  business_category?: string | null;
  location?: string | null;
  contact_email?: string | null;
  two_factor_enabled?: boolean | null;
  business_size?: string | null;
  primary_marketing_goal?: string | null;
  marketing_channels?: string[] | null;
  skill_levels?: SkillLevels | null;
  industry_keywords?: string[] | null;
  brand_primary_color?: string | null;
  brand_secondary_color?: string | null;
  brand_font_heading?: string | null;
  brand_font_body?: string | null;
  favorite_templates?: string[] | null;
  favorite_tools?: string[] | null;
  brand_logo?: string | null;
  business_bio?: string | null;
  operating_hours?: Record<string, any> | null;
  competitors?: string[] | null;
  weekly_notes?: WeeklyNote[] | null;
  momentum_score?: number | null;
  pinned_items?: string[] | null;
  apply_branding_to_templates?: boolean | null;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: '#22202F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.5rem', overflow: 'hidden', boxSizing: 'border-box' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string | null | undefined; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label style={{ display: 'block', marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.25rem' }}>{label}</div>
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0.6rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF1E7' }} />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string | null | undefined; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label style={{ display: 'block', marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.25rem' }}>{label}</div>
      <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0.6rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF1E7', resize: 'vertical', fontFamily: 'inherit' }} />
    </label>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { activeGoal } = useMarketing();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<'account' | 'business' | 'tracks' | 'favorites' | 'notifications'>('account');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [taskCompletions, setTaskCompletions] = useState<number>(0);
  const [loadingAIColors, setLoadingAIColors] = useState(false);
  const [weeklyNote, setWeeklyNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (!mounted) return;
      if (error) {
        setProfile(null);
      } else {
        setProfile(data as ProfileRecord);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  // Load task completions count
  useEffect(() => {
    if (!user || !activeGoal) return;
    
    // Count completed tasks from active goal
    const completed = activeGoal.modules.reduce((total, module) => {
      return total + module.tasks.filter(task => task.isCompleted).length;
    }, 0);
    
    setTaskCompletions(completed);
  }, [user?.id, activeGoal]);

  // Calculate and update momentum score
  useEffect(() => {
    if (!user || !activeGoal || !profile) return;

    const totalTasks = activeGoal.modules.reduce((total, module) => {
      return total + module.tasks.length;
    }, 0);

    const factors = getMomentumFactorsFromTrackData({
      tasksCompleted: taskCompletions,
      totalTasks,
      currentWeek: activeGoal.currentWeek,
      startDate: activeGoal.startDate || new Date().toISOString(),
      weeklyNotes: profile.weekly_notes || []
    });

    const score = calculateMomentumScore(factors);
    
    // Update if different
    if (score !== profile.momentum_score) {
      supabase
        .from('profiles')
        .update({ momentum_score: score })
        .eq('id', user.id)
        .then(() => {
          setProfile(p => p ? { ...p, momentum_score: score } : null);
        });
    }
  }, [taskCompletions, activeGoal, profile?.weekly_notes]);

  const save = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          business_name: profile.business_name,
          business_category: profile.business_category,
          location: profile.location,
          contact_email: profile.contact_email,
          two_factor_enabled: !!profile.two_factor_enabled,
          business_size: profile.business_size,
          primary_marketing_goal: profile.primary_marketing_goal,
          marketing_channels: profile.marketing_channels ?? [],
          skill_levels: profile.skill_levels ?? {},
          industry_keywords: profile.industry_keywords ?? [],
          brand_primary_color: profile.brand_primary_color,
          brand_secondary_color: profile.brand_secondary_color,
          brand_font_heading: profile.brand_font_heading,
          brand_font_body: profile.brand_font_body,
          favorite_templates: profile.favorite_templates ?? [],
          favorite_tools: profile.favorite_tools ?? [],
          brand_logo: profile.brand_logo,
          business_bio: profile.business_bio,
          operating_hours: profile.operating_hours,
          competitors: profile.competitors,
          weekly_notes: profile.weekly_notes,
          pinned_items: profile.pinned_items,
          apply_branding_to_templates: profile.apply_branding_to_templates
        })
        .eq('id', user.id);
      if (error) throw error;
      
      // Show success message
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAIColorSuggestions = async () => {
    if (!profile?.brand_primary_color) {
      alert('Please set a primary color first!');
      return;
    }

    setLoadingAIColors(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/profile/ai-color-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryColor: profile.brand_primary_color,
          logoBase64: profile.brand_logo
        })
      });

      const data = await response.json();
      if (data.success && data.data) {
        setProfile(p => p ? {
          ...p,
          brand_secondary_color: data.data.secondary,
          // Could also set accent/background if we add those fields
        } : null);
        alert('AI color suggestions applied! Review and save if you like them.');
      }
    } catch (error) {
      console.error('AI color error:', error);
      alert('Failed to get AI suggestions. Please try again.');
    } finally {
      setLoadingAIColors(false);
    }
  };

  const handleAddWeeklyNote = async () => {
    if (!weeklyNote.trim() || !user || !activeGoal) return;

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/profile/weekly-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          week: activeGoal.currentWeek,
          note: weeklyNote
        })
      });

      const data = await response.json();
      if (data.success) {
        setProfile(p => p ? { ...p, weekly_notes: data.data } : null);
        setWeeklyNote('');
        setShowNoteInput(false);
      }
    } catch (error) {
      console.error('Save note error:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const getSkillName = (key: string) => {
    const names: Record<string, string> = {
      social: 'Social Media',
      seo: 'SEO',
      ads: 'Advertising',
      design: 'Design',
      writing: 'Content Writing'
    };
    return names[key] || key;
  };

  const getSkillTip = (key: string, level: number) => {
    if (level === 0) return 'Just starting out - let\'s build this skill!';
    if (level <= 2) return 'Learning the basics - great progress!';
    if (level <= 4) return 'Solid skills - keep refining!';
    return 'Expert level - amazing work!';
  };

  const tabs = useMemo(() => ([
    { key: 'account', label: 'Account Settings' },
    { key: 'business', label: 'Business Profile' },
    { key: 'tracks', label: 'My Tracks & Progress' },
    { key: 'favorites', label: 'Saved & Favorites' },
    { key: 'notifications', label: 'Email Preferences' }
  ] as const), []);

  if (!user) return <div style={{ padding: '2rem' }}>Please sign in to view your profile.</div>;
  if (loading || !profile) return (
    <div style={{ padding: '2rem', color: '#FFF1E7' }}>
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ 
          display: 'inline-block',
          width: '48px',
          height: '48px',
          border: '4px solid rgba(239, 142, 129, 0.3)',
          borderTopColor: '#EF8E81',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '1rem', opacity: 0.7 }}>Loading your profile...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );

  return (
    <div style={{ 
      padding: isMobile ? '1rem' : '2rem', 
      color: '#FFF1E7', 
      maxWidth: '1200px', 
      margin: '0 auto' 
    }}>
      {/* Profile Header */}
      <ProfileHeader 
        profile={profile}
        onEditClick={() => setTab('account')}
      />

      {/* Track Completion Confetti */}
      <CompletionConfetti isComplete={activeGoal?.progress >= 100} />

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem', 
        flexWrap: isMobile ? 'nowrap' : 'wrap',
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {tabs.map(t => (
          <button 
            key={t.key} 
            onClick={() => setTab(t.key)} 
            style={{ 
              padding: isMobile ? '0.75rem 1rem' : '0.75rem 1.25rem', 
              borderRadius: 10, 
              border: tab === t.key ? '2px solid #EF8E81' : '1px solid rgba(255,255,255,0.12)', 
              background: tab === t.key ? 'rgba(239, 142, 129, 0.15)' : 'rgba(255,255,255,0.02)', 
              color: tab === t.key ? '#EF8E81' : '#FFF1E7', 
              cursor: 'pointer',
              fontWeight: tab === t.key ? 600 : 400,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              fontSize: isMobile ? '0.85rem' : '1rem',
              minHeight: '44px'
            }}
          >
            {t.label}
          </button>
        ))}
        {!isMobile && <span style={{ marginLeft: 'auto' }} />}
        <button 
          onClick={save} 
          disabled={saving} 
          style={{ 
            padding: '0.75rem 1.5rem', 
            borderRadius: 10, 
            border: 'none', 
            background: saving ? '#999' : 'linear-gradient(135deg, #EF8E81 0%, #D4AF37 100%)', 
            color: '#FFF', 
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            boxShadow: saving ? 'none' : '0 2px 8px rgba(239, 142, 129, 0.3)',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            width: isMobile ? '100%' : 'auto',
            minHeight: '44px',
            marginTop: isMobile ? '0.5rem' : '0'
          }}
        >
          {saving ? 'Saving…' : '💾 Save Changes'}
        </button>
      </div>

      {/* TAB 1: ACCOUNT SETTINGS */}
      {tab === 'account' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
          gap: isMobile ? '1rem' : '1.5rem' 
        }}>
          <Section title="Profile & Branding">
            <ImageUploader
              label="Brand Logo / Avatar"
              currentImage={profile.brand_logo || profile.avatar_url}
              onImageChange={(base64) => setProfile(p => p ? { ...p, brand_logo: base64 } : null)}
            />
            
            <Input 
              label="Full Name" 
              value={profile.full_name} 
              onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), full_name: v }))} 
              placeholder="Your full name"
            />
            
            <Input 
              label="Contact Email" 
              value={profile.contact_email ?? profile.email} 
              onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), contact_email: v }))}
              type="email"
              placeholder="your@email.com"
            />
          </Section>
          
          <Section title="Brand Colors & Fonts">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.25rem', display: 'block' }}>
                  Primary Color
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={profile.brand_primary_color || '#EF8E81'} 
                    onChange={(e) => setProfile(p => ({ ...(p as ProfileRecord), brand_primary_color: e.target.value }))}
                    style={{ width: '60px', height: '40px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}
                  />
                  <input 
                    type="text"
                    value={profile.brand_primary_color || '#EF8E81'}
                    onChange={(e) => setProfile(p => ({ ...(p as ProfileRecord), brand_primary_color: e.target.value }))}
                    style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF1E7', fontFamily: 'monospace' }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.25rem', display: 'block' }}>
                  Secondary Color
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={profile.brand_secondary_color || '#D4AF37'} 
                    onChange={(e) => setProfile(p => ({ ...(p as ProfileRecord), brand_secondary_color: e.target.value }))}
                    style={{ width: '60px', height: '40px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}
                  />
                  <input 
                    type="text"
                    value={profile.brand_secondary_color || '#D4AF37'}
                    onChange={(e) => setProfile(p => ({ ...(p as ProfileRecord), brand_secondary_color: e.target.value }))}
                    style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF1E7', fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAIColorSuggestions}
              disabled={loadingAIColors || !profile.brand_primary_color}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: 8,
                border: '1px solid rgba(212, 175, 55, 0.3)',
                background: loadingAIColors ? 'rgba(255,255,255,0.05)' : 'rgba(212, 175, 55, 0.1)',
                color: '#D4AF37',
                cursor: loadingAIColors || !profile.brand_primary_color ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
            >
              {loadingAIColors ? '🔄 Generating...' : '✨ Get AI Color Suggestions'}
            </button>

            <div style={{ marginTop: '1rem' }}>
              <Input 
                label="Heading Font" 
                value={profile.brand_font_heading} 
                onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), brand_font_heading: v }))}
                placeholder="e.g., Montserrat, Helvetica"
              />
              <Input 
                label="Body Font" 
                value={profile.brand_font_body} 
                onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), brand_font_body: v }))}
                placeholder="e.g., Open Sans, Arial"
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', padding: '0.75rem', background: 'rgba(239, 142, 129, 0.05)', borderRadius: 8, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={profile.apply_branding_to_templates ?? true}
                onChange={(e) => setProfile(p => ({ ...(p as ProfileRecord), apply_branding_to_templates: e.target.checked }))}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', flex: 1 }}>
                <strong>Apply my branding to generated content</strong>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
                  Automatically use your colors and fonts in AI-generated graphics
                </div>
              </span>
            </label>
          </Section>
        </div>
      )}

      {/* TAB 2: BUSINESS PROFILE */}
      {tab === 'business' && (
        <div style={{ display: 'grid', gap: isMobile ? '1rem' : '1.5rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
            gap: isMobile ? '1rem' : '1.5rem' 
          }}>
            <Section title="Business Details">
              <Input 
                label="Business Name" 
                value={profile.business_name} 
                onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), business_name: v }))}
                placeholder="Your business name"
              />
              <Input 
                label="Business Category" 
                value={profile.business_category} 
                onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), business_category: v }))}
                placeholder="e.g., Restaurant, Retail, Service"
              />
              <Input 
                label="Location" 
                value={profile.location} 
                onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), location: v }))}
                placeholder="City, State"
              />
              <Input 
                label="Business Size" 
                value={profile.business_size} 
                onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), business_size: v }))}
                placeholder="e.g., 1-10 employees"
              />
              
              <Textarea
                label="Business Bio"
                value={profile.business_bio}
                onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), business_bio: v }))}
                placeholder="Describe your business in 2-3 sentences..."
                rows={4}
              />
            </Section>
            
            <Section title="Market Intelligence">
              <Input 
                label="Primary Marketing Goal" 
                value={profile.primary_marketing_goal} 
                onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), primary_marketing_goal: v }))}
                placeholder="e.g., Increase foot traffic"
              />
              <Input 
                label="Main Channels" 
                value={(profile.marketing_channels || []).join(', ')} 
                onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), marketing_channels: v.split(',').map(s => s.trim()).filter(Boolean) }))}
                placeholder="Facebook, Instagram, Google, etc."
              />
              <Input 
                label="Industry Keywords" 
                value={(profile.industry_keywords || []).join(', ')} 
                onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), industry_keywords: v.split(',').map(s => s.trim()).filter(Boolean) }))}
                placeholder="organic, local, artisan, etc."
              />
              <Input 
                label="Top Competitors" 
                value={(profile.competitors || []).join(', ')} 
                onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), competitors: v.split(',').map(s => s.trim()).filter(Boolean) }))}
                placeholder="Competitor names (comma-separated)"
              />
            </Section>
          </div>

          {/* Marketing Skill Levels - Progress Bars */}
          <Section title="Marketing Skill Levels">
            <div style={{ display: 'grid', gap: '1rem' }}>
              {(['social', 'seo', 'ads', 'design', 'writing'] as const).map((skill) => {
                const level = (profile.skill_levels || {})[skill] ?? 0;
                const percentage = (level / 5) * 100;
                
                return (
                  <div key={skill}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                        {getSkillName(skill)}
                      </span>
                      <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                        Level {level}/5
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '100%',
                        height: '32px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: level === 0 ? '#777' : level <= 2 ? '#F59E0B' : level <= 4 ? '#3B82F6' : '#10B981',
                          transition: 'width 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingRight: '0.5rem'
                        }}>
                          {level > 0 && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FFF' }}>
                              {level}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Clickable segments */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '100%',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '2px'
                      }}>
                        {[1, 2, 3, 4, 5].map((segmentLevel) => (
                          <button
                            key={segmentLevel}
                            onClick={() => setProfile(p => ({ 
                              ...(p as ProfileRecord), 
                              skill_levels: { ...(p?.skill_levels || {}), [skill]: segmentLevel } 
                            }))}
                            title={getSkillTip(skill, segmentLevel)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              height: '100%'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem', fontStyle: 'italic' }}>
                      💡 {getSkillTip(skill, level)}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* AI Business Insights */}
          <AIInsightsPanel profile={profile} />
        </div>
      )}

      {/* TAB 3: TRACKS & PROGRESS */}
      {tab === 'tracks' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <Section title="Active Marketing Track">
            {activeGoal ? (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#EF8E81', marginBottom: '0.5rem' }}>
                    {activeGoal.title}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#FFF1E7', opacity: 0.8, lineHeight: 1.6 }}>
                    {activeGoal.description}
                  </div>
                </div>

                {/* Stats Cards */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
                  gap: '1rem', 
                  marginBottom: '1.5rem' 
                }}>
                  <div style={{ background: 'rgba(239, 142, 129, 0.1)', border: '1px solid rgba(239, 142, 129, 0.3)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Week</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#EF8E81' }}>
                      {activeGoal.currentWeek} <span style={{ fontSize: '1rem', opacity: 0.7 }}>/ {activeGoal.duration}</span>
                    </div>
                  </div>
                  
                  <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Progress</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#D4AF37' }}>
                      {activeGoal.progress}%
                    </div>
                  </div>
                  
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tasks Done</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>
                      {taskCompletions}
                    </div>
                  </div>
                </div>

                {/* Progress Timeline */}
                <ProgressTimeline 
                  activeGoal={activeGoal}
                  onWeekClick={(week) => {
                    console.log('Navigate to week:', week);
                    navigate('/app/marketing-track');
                  }}
                />

                {activeGoal.startDate && (
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.7, textAlign: 'center' }}>
                    🗓️ Started: {new Date(activeGoal.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
                  No active marketing track. Visit the Marketing Track page to get started!
                </p>
                <button
                  onClick={() => navigate('/app/marketing-track')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #EF8E81 0%, #D4AF37 100%)',
                    color: '#FFF',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Choose Your Track
                </button>
              </div>
            )}
          </Section>

          {/* Weekly Reflections */}
          {activeGoal && (
            <Section title="Weekly Reflections">
              <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1rem' }}>
                Track your progress, wins, and learnings each week!
              </div>
              
              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
                {(profile.weekly_notes || [])
                  .sort((a, b) => b.week - a.week)
                  .slice(0, 5)
                  .map((note) => (
                  <div 
                    key={note.week}
                    style={{
                      padding: '1rem',
                      background: '#1B1628',
                      borderRadius: 10,
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#EF8E81' }}>
                        Week {note.week}
                      </span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                        {new Date(note.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {note.note}
                    </p>
                  </div>
                ))}
                
                {(profile.weekly_notes || []).length === 0 && (
                  <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center', 
                    opacity: 0.5,
                    fontSize: '0.9rem'
                  }}>
                    No reflections yet. Add your first note below!
                  </div>
                )}
              </div>

              {/* Add Note */}
              {!showNoteInput ? (
                <button
                  onClick={() => setShowNoteInput(true)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 8,
                    border: '1px dashed rgba(239, 142, 129, 0.4)',
                    background: 'rgba(239, 142, 129, 0.05)',
                    color: '#EF8E81',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                >
                  + Add This Week's Note
                </button>
              ) : (
                <div style={{ 
                  padding: '1rem', 
                  background: '#1B1628', 
                  borderRadius: 10,
                  border: '2px solid #EF8E81'
                }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#EF8E81' }}>
                    Week {activeGoal.currentWeek} Reflection
                  </div>
                  <textarea
                    value={weeklyNote}
                    onChange={(e) => setWeeklyNote(e.target.value)}
                    placeholder="What did you accomplish this week? What did you learn?"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#FFF1E7',
                      fontSize: '0.9rem',
                      marginBottom: '0.75rem',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={handleAddWeeklyNote}
                      disabled={!weeklyNote.trim()}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        borderRadius: 8,
                        border: 'none',
                        background: weeklyNote.trim() ? '#10B981' : '#666',
                        color: '#FFF',
                        fontWeight: 600,
                        cursor: weeklyNote.trim() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      💾 Save Note
                    </button>
                    <button
                      onClick={() => {
                        setShowNoteInput(false);
                        setWeeklyNote('');
                      }}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: 8,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'transparent',
                        color: '#FFF1E7',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Quick Actions */}
          {activeGoal && (
            <Section title="Quick Actions">
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
                gap: '1rem' 
              }}>
                <button
                  onClick={() => navigate('/app/marketing-track')}
                  style={{
                    padding: '1rem',
                    borderRadius: 10,
                    border: '1px solid rgba(239, 142, 129, 0.3)',
                    background: 'rgba(239, 142, 129, 0.1)',
                    color: '#EF8E81',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 142, 129, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 142, 129, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</div>
                  <div style={{ fontSize: '0.9rem' }}>View This Week's Tasks</div>
                </button>

                <button
                  onClick={() => {
                    // TODO: Integrate with AI assistant
                    alert('AI Campaign Generator coming soon!');
                  }}
                  style={{
                    padding: '1rem',
                    borderRadius: 10,
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    background: 'rgba(212, 175, 55, 0.1)',
                    color: '#D4AF37',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✨</div>
                  <div style={{ fontSize: '0.9rem' }}>Generate Campaign Idea</div>
                </button>

                <button
                  onClick={() => {
                    // Generate shareable progress card
                    const shareText = `I'm on Week ${activeGoal.currentWeek} of my ${activeGoal.title} journey with MomentumDIY! ${activeGoal.progress}% complete 🚀`;
                    navigator.clipboard.writeText(shareText);
                    alert('Progress copied to clipboard! Paste it on social media.');
                  }}
                  style={{
                    padding: '1rem',
                    borderRadius: 10,
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    background: 'rgba(139, 92, 246, 0.1)',
                    color: '#8B5CF6',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📱</div>
                  <div style={{ fontSize: '0.9rem' }}>Share My Progress</div>
                </button>
              </div>
            </Section>
          )}
        </div>
      )}

      {/* TAB 4: FAVORITES */}
      {tab === 'favorites' && (
        <Section title="Favorite Templates & Tools">
          <div style={{ marginBottom: '1rem', opacity: 0.7, fontSize: '0.9rem' }}>
            Save your favorite templates and tools for quick access later!
          </div>
          <Input 
            label="Favorite Templates" 
            value={(profile.favorite_templates || []).join(', ')} 
            onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), favorite_templates: v.split(',').map(s => s.trim()).filter(Boolean) }))}
            placeholder="Email Campaign, Social Post, etc."
          />
          <Input 
            label="Favorite Tools" 
            value={(profile.favorite_tools || []).join(', ')} 
            onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), favorite_tools: v.split(',').map(s => s.trim()).filter(Boolean) }))}
            placeholder="Canva, Buffer, Mailchimp, etc."
          />
          
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: 10,
            fontSize: '0.85rem',
            opacity: 0.8
          }}>
            💡 <strong>Coming Soon:</strong> Visual template library with drag-and-drop organization!
          </div>
        </Section>
      )}

      {/* TAB 5: EMAIL PREFERENCES */}
      {tab === 'notifications' && (
        <EmailPreferences />
      )}
    </div>
  );
}
