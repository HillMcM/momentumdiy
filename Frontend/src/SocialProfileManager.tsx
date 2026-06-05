import { useEffect, useMemo, useState } from 'react';
import type { MarketingGoal } from './types';

type Props = { marketingGoals: MarketingGoal[] };

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: '#23233a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '1rem' }}>
    <h3 style={{ marginTop: 0, color: '#FFF1E7' }}>{title}</h3>
    <div style={{ color: '#FFF1E7' }}>{children}</div>
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => <span style={{ fontWeight: 700, color: '#FFF1E7' }}>{children}</span>;

export default function SocialProfileManager({ marketingGoals }: Props) {
  const activeCompleted = useMemo(() => marketingGoals.find(g => g.isActive && g.currentWeek >= g.duration) || marketingGoals.find(g => g.currentWeek >= g.duration), [marketingGoals]);
  const goalId = activeCompleted?.id || 'default';

  // Load pieces saved during the track
  const [pillars, setPillars] = useState<string[]>([]);
  const [styleGuide, setStyleGuide] = useState<{ voice?: string; audience?: string; adjectives?: string; brandPromise?: string } | null>(null);
  const [typography, setTypography] = useState<{ headingFont?: string; bodyFont?: string } | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [postTypes, setPostTypes] = useState<{ educate?: { angle?: string }; promote?: { angle?: string }; connect?: { angle?: string } } | null>(null);
  const [templates, setTemplates] = useState<unknown[]>([]);
  const [bio, setBio] = useState<{ what?: string; location?: string; cta?: string } | null>(null);
  const [links, setLinks] = useState<{ label?: string; url?: string }[]>([]);
  const [highlights, setHighlights] = useState<{ title?: string }[]>([]);
  const [baseline, setBaseline] = useState<unknown>(null);
  const [currentMetrics, setCurrentMetrics] = useState<unknown>(null);
  const [reflection, setReflection] = useState<unknown>(null);
  const [plan30, setPlan30] = useState<unknown>(null);

  useEffect(() => {
    const load = (key: string) => {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
    };
    setPillars(load(`pillars:${goalId}`) || []);
    setStyleGuide(load(`styleguide:${goalId}`));
    setTypography(load(`typography:${goalId}`));
    setPalette(load(`palette:${goalId}`) || []);
    setPostTypes(load(`posttypes:${goalId}`));
    setTemplates(load(`templates:${goalId}`) || []);
    setBio(load(`profilebio:${goalId}`));
    setLinks(load(`profilelinks:${goalId}`) || []);
    setHighlights(load(`profilehi:${goalId}`) || []);
    setBaseline(load(`baseline:state`) || null); // baseline stored in MarketingTrackPage state; fallback key if present
    setCurrentMetrics(load(`wk12metrics:${goalId}`));
    const wk12 = load(`wk12:${goalId}`);
    setReflection(wk12?.reflection || null);
    setPlan30(wk12?.plan || null);
  }, [goalId]);

  return (
    <div className="widget" style={{ padding: '1rem', borderRadius: 12 }}>
      <h1 style={{ marginTop: 0, color: '#FFF1E7' }}>Social Profile Manager</h1>
      {!activeCompleted && (
        <div style={{ background: 'rgba(239,142,129,0.08)', border: '1px solid rgba(239,142,129,0.25)', borderRadius: 8, padding: '0.75rem', color: '#FFF1E7' }}>
          Complete a track to unlock this page.
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <Card title="Strategy Snapshot">
          <div><Label>Content Pillars:</Label> {pillars.length ? pillars.join(', ') : '—'}</div>
          {postTypes && (
            <div style={{ marginTop: 8 }}>
              <Label>Post Types:</Label>
              <ul>
                <li>Educate — {postTypes.educate?.angle || '—'}</li>
                <li>Promote — {postTypes.promote?.angle || '—'}</li>
                <li>Connect — {postTypes.connect?.angle || '—'}</li>
              </ul>
            </div>
          )}
        </Card>
        <Card title="Brand Voice & Visuals">
          {styleGuide && (
            <div>
              <div><Label>Voice:</Label> {styleGuide.voice || '—'}</div>
              <div><Label>Audience:</Label> {styleGuide.audience || '—'}</div>
              <div><Label>Adjectives:</Label> {styleGuide.adjectives || '—'}</div>
              <div><Label>Promise:</Label> {styleGuide.brandPromise || '—'}</div>
            </div>
          )}
          {typography && (
            <div style={{ marginTop: 8 }}>
              <div><Label>Heading:</Label> {typography.headingFont}</div>
              <div><Label>Body:</Label> {typography.bodyFont}</div>
            </div>
          )}
          {!!palette?.length && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              {palette.map((c, i) => (
                <div key={i} title={c} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.25)' }} />
              ))}
            </div>
          )}
        </Card>
        <Card title="Profile">
          {bio && (
            <div>
              <div><Label>What:</Label> {bio.what || '—'}</div>
              <div><Label>Location:</Label> {bio.location || '—'}</div>
              <div><Label>CTA:</Label> {bio.cta || '—'}</div>
            </div>
          )}
          {!!links?.length && (
            <div style={{ marginTop: 8 }}>
              <Label>Links:</Label>
              <ul>{links.map((l, i) => <li key={i}>{l.label}: {l.url}</li>)}</ul>
            </div>
          )}
          {!!highlights?.length && (
            <div style={{ marginTop: 8 }}>
              <Label>Highlights:</Label>
              <ul>{highlights.map((h, i) => <li key={i}>{h.title}</li>)}</ul>
            </div>
          )}
        </Card>
        <Card title="Analytics">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label>Baseline</Label>
              <pre style={{ whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.04)', padding: 8, borderRadius: 6 }}>{JSON.stringify(baseline || {}, null, 2)}</pre>
            </div>
            <div>
              <Label>Current</Label>
              <pre style={{ whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.04)', padding: 8, borderRadius: 6 }}>{JSON.stringify(currentMetrics || {}, null, 2)}</pre>
            </div>
          </div>
        </Card>
        <Card title="Reflection & Next 30‑Day Focus">
          <div><Label>Reflection:</Label>
            <pre style={{ whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.04)', padding: 8, borderRadius: 6 }}>{JSON.stringify(reflection || {}, null, 2)}</pre>
          </div>
          <div style={{ marginTop: 8 }}><Label>30‑Day Plan:</Label>
            <pre style={{ whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.04)', padding: 8, borderRadius: 6 }}>{JSON.stringify(plan30 || {}, null, 2)}</pre>
          </div>
        </Card>
        <Card title="Templates">
          {templates.length ? (
            <ul>
              {templates.map((t: any, i) => (
                <li key={i}><strong>{t.name || 'Untitled'}</strong> — {t.type || '—'} {t.canvaUrl ? (<a href={t.canvaUrl} target="_blank" rel="noreferrer">open</a>) : null}</li>
              ))}
            </ul>
          ) : '—'}
        </Card>
      </div>
    </div>
  );
}


