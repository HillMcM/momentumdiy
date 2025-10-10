import * as React from 'react';
import { useState } from 'react';
import type { SocialMetrics, WeeklySnapshot } from '../../types';

interface MetricsTabProps {
  baselineMetrics: SocialMetrics;
  currentMetrics: SocialMetrics;
  weeklySnapshots: WeeklySnapshot[];
  onBaselineChange: (metrics: SocialMetrics) => void;
  onCurrentChange: (metrics: SocialMetrics) => void;
  onAddSnapshot: (snapshot: WeeklySnapshot) => void;
}

export default function MetricsTab({
  baselineMetrics,
  currentMetrics,
  weeklySnapshots,
  onBaselineChange,
  onCurrentChange,
  onAddSnapshot
}: MetricsTabProps) {
  // Ensure arrays and objects have defaults
  const safeSnapshots = weeklySnapshots || [];
  const safeBaseline = baselineMetrics || { followers: 0, avgLikes: 0, avgComments: 0, storyViews: 0, date: '' };
  const safeCurrent = currentMetrics || { followers: 0, avgLikes: 0, avgComments: 0, storyViews: 0, date: '' };
  
  const [showSnapshotForm, setShowSnapshotForm] = useState(false);
  const [newSnapshot, setNewSnapshot] = useState<Partial<WeeklySnapshot>>({
    week: (safeSnapshots.length || 0) + 1,
    date: new Date().toISOString().split('T')[0],
    metrics: {
      followers: 0,
      avgLikes: 0,
      avgComments: 0,
      storyViews: 0,
      date: new Date().toISOString().split('T')[0]
    }
  });

  const calculateGrowth = (baseline: number, current: number) => {
    if (!baseline || baseline === 0) return 0;
    return Math.round(((current - baseline) / baseline) * 100);
  };

  const handleAddSnapshot = () => {
    if (newSnapshot.week && newSnapshot.date && newSnapshot.metrics) {
      onAddSnapshot(newSnapshot as WeeklySnapshot);
      setNewSnapshot({
        week: (safeSnapshots.length || 0) + 2,
        date: new Date().toISOString().split('T')[0],
        metrics: {
          followers: 0,
          avgLikes: 0,
          avgComments: 0,
          storyViews: 0,
          date: new Date().toISOString().split('T')[0]
        }
      });
      setShowSnapshotForm(false);
    }
  };

  const MetricCard = ({
    label,
    baseline,
    current,
    onBaselineChange,
    onCurrentChange
  }: {
    label: string;
    baseline: number;
    current: number;
    onBaselineChange: (val: number) => void;
    onCurrentChange: (val: number) => void;
  }) => {
    const growth = calculateGrowth(baseline, current);
    const isPositive = growth > 0;
    const isNegative = growth < 0;

    return (
      <div className="bg-[#1A1625]/50 rounded-lg p-6 border border-[#2A2438]">
        <h4 className="text-[#FFF1E7]/80 text-sm font-medium mb-4">{label}</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[#FFF1E7]/60 text-xs block mb-1">Baseline</label>
            <input
              type="number"
              value={baseline || ''}
              onChange={(e) => onBaselineChange(parseInt(e.target.value) || 0)}
              className="w-full bg-[#2A2438] text-[#FFF1E7] px-3 py-2 rounded border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-[#FFF1E7]/60 text-xs block mb-1">Current</label>
            <input
              type="number"
              value={current || ''}
              onChange={(e) => onCurrentChange(parseInt(e.target.value) || 0)}
              className="w-full bg-[#2A2438] text-[#FFF1E7] px-3 py-2 rounded border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-sm"
              placeholder="0"
            />
          </div>
        </div>

        {baseline > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-[#2A2438]">
            <span className="text-[#FFF1E7]/60 text-xs">Growth</span>
            <div className={`flex items-center text-sm font-bold ${
              isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-[#FFF1E7]/60'
            }`}>
              {isPositive && (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )}
              {isNegative && (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              {growth > 0 && '+'}{growth}%
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#FFF1E7] mb-2">Metrics Tracking</h3>
        <p className="text-[#FFF1E7]/60 text-sm mb-4">
          Track your social media growth by recording your baseline metrics and updating your current stats regularly.
        </p>
      </div>

      {/* Date Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#2A2438]/50 rounded-lg p-4 border border-[#3A3448]">
          <label className="text-[#FFF1E7]/60 text-xs block mb-1">Baseline Date</label>
          <input
            type="date"
            value={safeBaseline.date || ''}
            onChange={(e) => onBaselineChange({ ...safeBaseline, date: e.target.value })}
            className="w-full bg-[#1A1625] text-[#FFF1E7] px-3 py-2 rounded border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-sm"
          />
        </div>
        <div className="bg-[#2A2438]/50 rounded-lg p-4 border border-[#3A3448]">
          <label className="text-[#FFF1E7]/60 text-xs block mb-1">Last Updated</label>
          <input
            type="date"
            value={safeCurrent.date || ''}
            onChange={(e) => onCurrentChange({ ...safeCurrent, date: e.target.value })}
            className="w-full bg-[#1A1625] text-[#FFF1E7] px-3 py-2 rounded border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-sm"
          />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          label="Followers"
          baseline={safeBaseline.followers || 0}
          current={safeCurrent.followers || 0}
          onBaselineChange={(val) => onBaselineChange({ ...safeBaseline, followers: val })}
          onCurrentChange={(val) => onCurrentChange({ ...safeCurrent, followers: val })}
        />
        <MetricCard
          label="Avg. Likes per Post"
          baseline={safeBaseline.avgLikes || 0}
          current={safeCurrent.avgLikes || 0}
          onBaselineChange={(val) => onBaselineChange({ ...safeBaseline, avgLikes: val })}
          onCurrentChange={(val) => onCurrentChange({ ...safeCurrent, avgLikes: val })}
        />
        <MetricCard
          label="Avg. Comments per Post"
          baseline={safeBaseline.avgComments || 0}
          current={safeCurrent.avgComments || 0}
          onBaselineChange={(val) => onBaselineChange({ ...safeBaseline, avgComments: val })}
          onCurrentChange={(val) => onCurrentChange({ ...safeCurrent, avgComments: val })}
        />
        <MetricCard
          label="Avg. Story Views"
          baseline={safeBaseline.storyViews || 0}
          current={safeCurrent.storyViews || 0}
          onBaselineChange={(val) => onBaselineChange({ ...safeBaseline, storyViews: val })}
          onCurrentChange={(val) => onCurrentChange({ ...safeCurrent, storyViews: val })}
        />
      </div>

      {/* Weekly Snapshots */}
      <div className="pt-6 border-t border-[#2A2438]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[#FFF1E7] font-medium">Weekly Snapshots</h4>
          <button
            onClick={() => setShowSnapshotForm(!showSnapshotForm)}
            className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Snapshot
          </button>
        </div>

        {showSnapshotForm && (
          <div className="bg-[#1A1625]/50 rounded-lg p-6 border border-[#2A2438] mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[#FFF1E7]/80 text-sm block mb-2">Week Number</label>
                <input
                  type="number"
                  value={newSnapshot.week || ''}
                  onChange={(e) => setNewSnapshot({ ...newSnapshot, week: parseInt(e.target.value) || 1 })}
                  className="w-full bg-[#2A2438] text-[#FFF1E7] px-3 py-2 rounded border border-[#3A3448] focus:outline-none focus:border-[#EF8E81]"
                />
              </div>
              <div>
                <label className="text-[#FFF1E7]/80 text-sm block mb-2">Date</label>
                <input
                  type="date"
                  value={newSnapshot.date || ''}
                  onChange={(e) => setNewSnapshot({ ...newSnapshot, date: e.target.value })}
                  className="w-full bg-[#2A2438] text-[#FFF1E7] px-3 py-2 rounded border border-[#3A3448] focus:outline-none focus:border-[#EF8E81]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-[#FFF1E7]/60 text-xs block mb-1">Followers</label>
                <input
                  type="number"
                  value={newSnapshot.metrics?.followers || ''}
                  onChange={(e) => setNewSnapshot({
                    ...newSnapshot,
                    metrics: { ...newSnapshot.metrics!, followers: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full bg-[#2A2438] text-[#FFF1E7] px-3 py-2 rounded border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-sm"
                />
              </div>
              <div>
                <label className="text-[#FFF1E7]/60 text-xs block mb-1">Avg Likes</label>
                <input
                  type="number"
                  value={newSnapshot.metrics?.avgLikes || ''}
                  onChange={(e) => setNewSnapshot({
                    ...newSnapshot,
                    metrics: { ...newSnapshot.metrics!, avgLikes: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full bg-[#2A2438] text-[#FFF1E7] px-3 py-2 rounded border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-sm"
                />
              </div>
              <div>
                <label className="text-[#FFF1E7]/60 text-xs block mb-1">Avg Comments</label>
                <input
                  type="number"
                  value={newSnapshot.metrics?.avgComments || ''}
                  onChange={(e) => setNewSnapshot({
                    ...newSnapshot,
                    metrics: { ...newSnapshot.metrics!, avgComments: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full bg-[#2A2438] text-[#FFF1E7] px-3 py-2 rounded border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-sm"
                />
              </div>
              <div>
                <label className="text-[#FFF1E7]/60 text-xs block mb-1">Story Views</label>
                <input
                  type="number"
                  value={newSnapshot.metrics?.storyViews || ''}
                  onChange={(e) => setNewSnapshot({
                    ...newSnapshot,
                    metrics: { ...newSnapshot.metrics!, storyViews: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full bg-[#2A2438] text-[#FFF1E7] px-3 py-2 rounded border border-[#3A3448] focus:outline-none focus:border-[#EF8E81] text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSnapshotForm(false)}
                className="px-4 py-2 text-[#FFF1E7]/60 hover:text-[#FFF1E7] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSnapshot}
                className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Save Snapshot
              </button>
            </div>
          </div>
        )}

        {safeSnapshots.length > 0 ? (
          <div className="space-y-2">
            {safeSnapshots.sort((a, b) => b.week - a.week).map((snapshot) => (
              <div key={`${snapshot.week}-${snapshot.date}`} className="bg-[#1A1625]/50 rounded-lg p-4 border border-[#2A2438]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[#FFF1E7] font-medium">Week {snapshot.week}</span>
                    <span className="text-[#FFF1E7]/40 text-sm ml-3">{snapshot.date}</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-[#FFF1E7]/60 text-xs">Followers</div>
                    <div className="text-[#FFF1E7] font-medium">{snapshot.metrics.followers}</div>
                  </div>
                  <div>
                    <div className="text-[#FFF1E7]/60 text-xs">Avg Likes</div>
                    <div className="text-[#FFF1E7] font-medium">{snapshot.metrics.avgLikes}</div>
                  </div>
                  <div>
                    <div className="text-[#FFF1E7]/60 text-xs">Avg Comments</div>
                    <div className="text-[#FFF1E7] font-medium">{snapshot.metrics.avgComments}</div>
                  </div>
                  <div>
                    <div className="text-[#FFF1E7]/60 text-xs">Story Views</div>
                    <div className="text-[#FFF1E7] font-medium">{snapshot.metrics.storyViews}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#2A2438]/30 border border-[#3A3448] rounded-lg p-8 text-center">
            <div className="text-[#FFF1E7]/40">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-[#FFF1E7]/60 text-sm">
              No weekly snapshots yet. Add snapshots to track your progress over time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

