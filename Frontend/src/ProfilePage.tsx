import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';

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
    <section style={{ background: '#22202F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem' }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: any; onChange: (v: string) => void; type?: string }) {
  return (
    <label style={{ display: 'block', marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{label}</div>
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF1E7' }} />
    </label>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'account' | 'business' | 'tracks' | 'favorites' | 'integrations'>('account');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);

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
    { key: 'integrations', label: 'Integrations' }
  ] as const), []);

  if (!user) return <div style={{ padding: '2rem' }}>Please sign in to view your profile.</div>;
  if (loading || !profile) return <div style={{ padding: '2rem' }}>Loading profile…</div>;

  return (
    <div style={{ padding: '2rem', color: '#FFF1E7' }}>
      <h1 style={{ marginTop: 0 }}>My Profile</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{ padding: '0.5rem 0.9rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: tab === t.key ? '#EF8E81' : 'transparent', color: tab === t.key ? '#22202F' : '#FFF1E7', cursor: 'pointer' }}>{t.label}</button>
        ))}
        <span style={{ marginLeft: 'auto' }} />
        <button onClick={save} disabled={saving} style={{ padding: '0.5rem 0.9rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: '#EF8E81', color: '#22202F', cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save Changes'}</button>
      </div>

      {tab === 'account' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Section title="Core Account Info">
            <Input label="Full Name" value={profile.full_name} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), full_name: v }))} />
            <Input label="Contact Email" value={profile.contact_email ?? profile.email} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), contact_email: v }))} />
            <Input label="Avatar URL" value={profile.avatar_url} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), avatar_url: v }))} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
              <input type="checkbox" checked={!!profile.two_factor_enabled} onChange={(e) => setProfile(p => ({ ...(p as ProfileRecord), two_factor_enabled: e.target.checked }))} />
              Enable 2FA (coming soon)
            </label>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
              {['social','seo','ads','design','writing'].map((k) => (
                <label key={k} style={{ fontSize: '0.85rem' }}>
                  {k.toUpperCase()} Skill (0-5)
                  <input type="number" min={0} max={5} value={(profile.skill_levels || {})[k as keyof SkillLevels] ?? 0} onChange={(e) => setProfile(p => ({ ...(p as ProfileRecord), skill_levels: { ...(p?.skill_levels || {}), [k]: Number(e.target.value) } }))} style={{ width: '100%', padding: '0.4rem 0.5rem', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF1E7' }} />
                </label>
              ))}
            </div>
          </Section>
        </div>
      )}

      {tab === 'tracks' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <Section title="My Tracks & Progress">
            <p>Active 90-Day Track progress snapshot and past tracks badges will appear here. (Coming soon)</p>
          </Section>
          <Section title="Progress & Metrics">
            <p>Tasks completed this week, streaks, reach improvement, milestones. (Coming soon)</p>
          </Section>
        </div>
      )}

      {tab === 'favorites' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Section title="Favorite Templates/Tools">
            <Input label="Favorite Templates (comma-separated)" value={(profile.favorite_templates || []).join(', ')} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), favorite_templates: v.split(',').map(s => s.trim()).filter(Boolean) }))} />
            <Input label="Favorite Tools (comma-separated)" value={(profile.favorite_tools || []).join(', ')} onChange={(v) => setProfile(p => ({ ...(p as ProfileRecord), favorite_tools: v.split(',').map(s => s.trim()).filter(Boolean) }))} />
          </Section>
          <Section title="AI History & Pins">
            <p>AI chat history & pinned conversations will surface here. (Coming soon)</p>
          </Section>
        </div>
      )}

      {tab === 'integrations' && (
        <Section title="Integrations">
          <p>Connect email, social, analytics. (Coming soon)</p>
        </Section>
      )}
    </div>
  );
}


