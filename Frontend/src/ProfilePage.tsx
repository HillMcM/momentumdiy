import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './contexts/useAuth';
import { supabase } from './lib/supabase';
import EmailPreferences from './components/EmailPreferences';
import { useMarketing } from './contexts/MarketingContext';

type SkillLevels = {
  social?: number;
  seo?: number;
  ads?: number;
  design?: number;
  writing?: number;
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
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: '#22202F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem', overflow: 'hidden', boxSizing: 'border-box' }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string | null | undefined; onChange: (v: string) => void; type?: string }) {
  return (
    <label style={{ display: 'block', marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{label}</div>
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0.6rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF1E7' }} />
    </label>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { activeGoal } = useMarketing();
  const [tab, setTab] = useState<'account' | 'business' | 'tracks' | 'favorites' | 'notifications'>('account');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [taskCompletions, setTaskCompletions] = useState<number>(0);

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
    if (!user) return;
    let mounted = true;
    (async () => {
      const { count, error } = await supabase
        .from('user_task_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (!mounted) return;
      if (!error && count !== null) {
        setTaskCompletions(count);
      }
    })();
    return () => { mounted = false; };
  }, [user?.id]);

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
          favorite_tools: profile.favorite_tools ?? []
        })
        .eq('id', user.id);
      if (error) throw error;
    } finally {
      setSaving(false);
    }
  };

  const tabs = useMemo(() => ([
    { key: 'account', label: 'Account Settings' },
    { key: 'business', label: 'Business Profile' },
    { key: 'tracks', label: 'My Tracks & Progress' },
    { key: 'favorites', label: 'Saved & Favorites' },
    { key: 'notifications', label: 'Email Preferences' }
  ] as const), []);

  if (!user) return <div style={{ padding: '2rem' }}>Please sign in to view your profile.</div>;
  if (loading || !profile) return <div style={{ padding: '2rem' }}>Loading profile…</div>;

  return (
    <div style={{ padding: '2rem', color: '#FFF1E7' }}>
      <h1 style={{ marginTop: 0 }}>My Profile</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '0.5rem 0.9rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: tab === t.key ? '#EF8E81' : 'transparent', color: tab === t.key ? '#22202F' : '#FFF1E7', cursor: 'pointer' }}>{t.label}</button>
        ))}
        <span style={{ marginLeft: 'auto' }} />
        <button onClick={save} disabled={saving} style={{ padding: '0.5rem 0.9rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: '#EF8E81', color: '#22202F', cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save Changes'}</button>
      </div>

      {tab === 'account' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1rem' }}>
          <Section title="Core Account Info">
            <Input label="Full Name" value={profile.full_name} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), full_name: v }))} />
            <Input label="Contact Email" value={profile.contact_email ?? profile.email} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), contact_email: v }))} />
            <Input label="Avatar URL" value={profile.avatar_url} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), avatar_url: v }))} />
          </Section>
          <Section title="Branding Settings">
            <Input label="Brand Primary Color" value={profile.brand_primary_color} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), brand_primary_color: v }))} />
            <Input label="Brand Secondary Color" value={profile.brand_secondary_color} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), brand_secondary_color: v }))} />
            <Input label="Heading Font" value={profile.brand_font_heading} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), brand_font_heading: v }))} />
            <Input label="Body Font" value={profile.brand_font_body} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), brand_font_body: v }))} />
          </Section>
        </div>
      )}

      {tab === 'business' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1rem' }}>
          <Section title="Business Details">
            <Input label="Business Name" value={profile.business_name} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), business_name: v }))} />
            <Input label="Business Category" value={profile.business_category} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), business_category: v }))} />
            <Input label="Location (City, State)" value={profile.location} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), location: v }))} />
            <Input label="Business Size" value={profile.business_size} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), business_size: v }))} />
          </Section>
          <Section title="Marketing Context">
            <Input label="Primary Marketing Goal" value={profile.primary_marketing_goal} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), primary_marketing_goal: v }))} />
            <Input label="Main Channels (comma-separated)" value={(profile.marketing_channels || []).join(', ')} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), marketing_channels: v.split(',').map(s => s.trim()).filter(Boolean) }))} />
            <Input label="Industry Keywords (comma-separated)" value={(profile.industry_keywords || []).join(', ')} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), industry_keywords: v.split(',').map(s => s.trim()).filter(Boolean) }))} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
              {['social','seo','ads','design','writing'].map((k) => (
                <label key={k} style={{ fontSize: '0.85rem' }}>
                  {k.toUpperCase()} Skill (0-5)
                  <input type="number" min={0} max={5} value={(profile.skill_levels || {})[k as keyof SkillLevels] ?? 0} onChange={(e) => setProfile(p => ({ ...(p as ProfileRecord), skill_levels: { ...(p?.skill_levels || {}), [k]: Number(e.target.value) } }))} style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0.4rem 0.5rem', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF1E7' }} />
                </label>
              ))}
            </div>
          </Section>
        </div>
      )}

      {tab === 'tracks' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <Section title="Active Marketing Track">
            {activeGoal ? (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#EF8E81', marginBottom: '0.5rem' }}>
                    {activeGoal.title}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#FFF1E7', opacity: 0.8 }}>
                    {activeGoal.description}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ background: 'rgba(239, 142, 129, 0.1)', border: '1px solid rgba(239, 142, 129, 0.3)', borderRadius: 8, padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>Current Week</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EF8E81' }}>
                      {activeGoal.currentWeek} <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>/ {activeGoal.duration}</span>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 8, padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>Progress</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D4AF37' }}>
                      {activeGoal.progress}%
                    </div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>Tasks Done</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>
                      {taskCompletions}
                    </div>
                  </div>
                </div>
                {activeGoal.startDate && (
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.7 }}>
                    Started: {new Date(activeGoal.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ opacity: 0.7 }}>No active marketing track. Visit the Marketing Track page to get started!</p>
            )}
          </Section>
        </div>
      )}

      {tab === 'favorites' && (
        <Section title="Favorite Templates/Tools">
          <Input label="Favorite Templates (comma-separated)" value={(profile.favorite_templates || []).join(', ')} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), favorite_templates: v.split(',').map(s => s.trim()).filter(Boolean) }))} />
          <Input label="Favorite Tools (comma-separated)" value={(profile.favorite_tools || []).join(', ')} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), favorite_tools: v.split(',').map(s => s.trim()).filter(Boolean) }))} />
        </Section>
      )}

      {tab === 'notifications' && (
        <EmailPreferences />
      )}
    </div>
  );
}


