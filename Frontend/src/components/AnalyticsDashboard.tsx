import { useAnalytics } from '../contexts/AnalyticsContext';

interface AnalyticsDashboardProps {
  compact?: boolean;
}

export default function AnalyticsDashboard({ compact = false }: AnalyticsDashboardProps) {
  const { metrics, insights, isLoading, error, refreshMetrics } = useAnalytics();

  if (isLoading) {
    return (
      <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-[#2A243E]/60 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-600 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-red-500/30 p-6">
        <div className="text-center">
          <div className="text-red-400 mb-2">📊 Analytics Error</div>
          <div className="text-gray-400 text-sm mb-4">{error}</div>
          <button
            onClick={refreshMetrics}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-[#2A243E]/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">📊 Business Analytics</h2>
            <p className="text-gray-400 text-sm">Real-time performance insights</p>
          </div>
          <button
            onClick={refreshMetrics}
            className="bg-[#2A243E] hover:bg-[#3A344E] text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Google Business Profile */}
          {metrics?.googleBusinessProfile && (
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">🏪</div>
                <div>
                  <div className="text-blue-400 font-medium">Google Business</div>
                  <div className="text-gray-400 text-xs">Profile Performance</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Views</span>
                  <span className="text-white font-medium">{metrics.googleBusinessProfile.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Calls</span>
                  <span className="text-green-400 font-medium">{metrics.googleBusinessProfile.calls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Rating</span>
                  <span className="text-yellow-400 font-medium">⭐ {metrics.googleBusinessProfile.rating}</span>
                </div>
              </div>
            </div>
          )}

          {/* Social Media */}
          {metrics?.socialMedia && metrics.socialMedia.length > 0 && (
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">📱</div>
                <div>
                  <div className="text-purple-400 font-medium">Social Media</div>
                  <div className="text-gray-400 text-xs">Combined Performance</div>
                </div>
              </div>
              <div className="space-y-2">
                {metrics.socialMedia.map((platform: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-400 text-sm capitalize">{platform.platform}</span>
                    <span className="text-white font-medium">{platform.engagement}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Website */}
          {metrics?.website && (
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">🌐</div>
                <div>
                  <div className="text-green-400 font-medium">Website</div>
                  <div className="text-gray-400 text-xs">Traffic & Engagement</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Visitors</span>
                  <span className="text-white font-medium">{metrics.website.visitors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Bounce Rate</span>
                  <span className="text-orange-400 font-medium">{metrics.website.bounceRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Conversion</span>
                  <span className="text-green-400 font-medium">{metrics.website.conversionRate}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-[#2A243E]/60 p-6">
          <h3 className="text-lg font-bold text-white mb-4">💡 AI-Powered Insights</h3>
          <div className="space-y-3">
            {insights.slice(0, compact ? 3 : 6).map((insight: any) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border ${
                  insight.type === 'success' ? 'bg-green-500/10 border-green-500/20' :
                  insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                  insight.type === 'opportunity' ? 'bg-blue-500/10 border-blue-500/20' :
                  'bg-purple-500/10 border-purple-500/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white">{insight.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    insight.type === 'success' ? 'bg-green-500/20 text-green-400' :
                    insight.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    insight.type === 'opportunity' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {insight.type}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{insight.metric}</span>
                  {insight.actionable && insight.actionText && (
                    <button className="text-blue-400 hover:text-blue-300 text-sm underline">
                      {insight.actionText}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-[#2A243E]/60 p-6">
        <h3 className="text-lg font-bold text-white mb-4">🔗 Connected Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: 'Google Business Profile', connected: !!metrics?.googleBusinessProfile, icon: '🏪' },
            { name: 'Facebook', connected: metrics?.socialMedia?.some((p: any) => p.platform === 'facebook'), icon: '📘' },
            { name: 'Instagram', connected: metrics?.socialMedia?.some((p: any) => p.platform === 'instagram'), icon: '📷' },
            { name: 'Google Analytics', connected: !!metrics?.website, icon: '📊' }
          ].map((platform, index) => (
            <div key={index} className="text-center">
              <div className={`text-2xl mb-2 ${platform.connected ? 'opacity-100' : 'opacity-30'}`}>
                {platform.icon}
              </div>
              <div className={`text-sm font-medium ${platform.connected ? 'text-green-400' : 'text-gray-400'}`}>
                {platform.connected ? '✅ Connected' : '❌ Not Connected'}
              </div>
              <div className="text-gray-400 text-xs mt-1">{platform.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
