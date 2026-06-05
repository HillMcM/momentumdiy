import { useState, useEffect } from 'react';
import { API_URL } from './config/environment';
import AdminGuard from './components/AdminGuard';
import { supabase } from './lib/supabase';
import { useNotificationHelpers } from './hooks/useNotificationHelpers';
import { logger } from './utils/logger';

interface AdminStats {
  totalAffiliates: number;
  activeAffiliates: number;
  totalReferrals: number;
  convertedReferrals: number;
  conversionRate: number;
  totalRevenue: number;
  totalCommissions: number;
  totalPaidOut: number;
  pendingPayouts: number;
  netProfit: number;
  averageCommissionPerAffiliate: number;
}

interface Affiliate {
  id: string;
  user_id: string;
  referral_code: string;
  status: string;
  total_referrals: number;
  total_earnings: number;
  total_paid_out: number;
  pending_balance: number;
  opted_in_at: string;
  profiles: {
    business_name: string;
    contact_email: string;
  };
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  affiliate: {
    referral_code: string;
    profiles: {
      business_name: string;
      contact_email: string;
    };
  };
}

interface RevenueReport {
  totalRevenue: number;
  totalCommissions: number;
  netProfit: number;
  planBreakdown: {
    [key: string]: {
      revenue: number;
      commission: number;
      count: number;
    };
  };
}

export default function AdminAffiliatePage() {
  const { showSuccess, showError, showWarning } = useNotificationHelpers();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'affiliates' | 'payouts' | 'revenue' | 'partner-applications'>('overview');
  const [partnerApplications, setPartnerApplications] = useState<any[]>([]);
  const [processingApplication, setProcessingApplication] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        return;
      }

      const headers = { 'Authorization': `Bearer ${session.access_token}` };

      // Load all data in parallel
      const [statsRes, affiliatesRes, payoutsRes, revenueRes, applicationsRes] = await Promise.all([
        fetch(`${API_URL}/api/affiliate/admin/stats`, { headers }),
        fetch(`${API_URL}/api/affiliate/admin/affiliates`, { headers }),
        fetch(`${API_URL}/api/affiliate/admin/payouts`, { headers }),
        fetch(`${API_URL}/api/affiliate/admin/revenue-report`, { headers }),
        fetch(`${API_URL}/api/affiliate/partner/applications`, { headers }),
      ]);

      const [statsData, affiliatesData, payoutsData, revenueData, applicationsData] = await Promise.all([
        statsRes.json(),
        affiliatesRes.json(),
        payoutsRes.json(),
        revenueRes.json(),
        applicationsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (affiliatesData.success) setAffiliates(affiliatesData.data);
      if (payoutsData.success) setPayouts(payoutsData.data);
      if (revenueData.success) setRevenue(revenueData.data);
      if (applicationsData.success) setPartnerApplications(applicationsData.data || []);
    } catch (err) {
      logger.error('Error loading admin data', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayouts = async () => {
    if (!confirm('Process all pending payouts? This will initiate transfers via Stripe Connect.')) {
      return;
    }

    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/api/affiliate/admin/process-payouts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      const result = await response.json();

      if (result.success) {
        const processed = result.processed || 0;
        const failed = result.failed || 0;
        if (failed > 0) {
          showWarning('Payouts Processed', `Processed ${processed} payouts successfully. ${failed} failed.`);
        } else {
          showSuccess('Payouts Processed', `Successfully processed ${processed} payout(s).`);
        }
        loadData(); // Reload data
      } else {
        showError('Payout Processing Failed', 'Failed to process payouts. Please try again.');
      }
    } catch (err) {
      logger.error('Error processing payouts', err);
      setError('Failed to process payouts');
      showError('Payout Processing Failed', 'Failed to process payouts. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleApproveApplication = async (applicationId: string) => {
    if (!confirm('Approve this partner application? This will create an affiliate account and send an approval email.')) {
      return;
    }

    setProcessingApplication(applicationId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/api/affiliate/partner/approve/${applicationId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Application Approved', 'Application approved successfully! An email has been sent to the applicant.');
        loadData(); // Reload data
      } else {
        showError('Approval Failed', `Failed to approve application: ${result.error}`);
      }
    } catch (err) {
      logger.error('Error approving application', err);
      setError('Failed to approve application');
      showError('Approval Failed', 'Failed to approve application. Please try again.');
    } finally {
      setProcessingApplication(null);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    setProcessingApplication(applicationId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/api/affiliate/partner/reject/${applicationId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: reason || undefined }),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Application Rejected', 'Application rejected successfully.');
        loadData(); // Reload data
      } else {
        showError('Rejection Failed', `Failed to reject application: ${result.error}`);
      }
    } catch (err) {
      logger.error('Error rejecting application', err);
      setError('Failed to reject application');
      showError('Rejection Failed', 'Failed to reject application. Please try again.');
    } finally {
      setProcessingApplication(null);
    }
  };

  // Don't wrap with AdminGuard here - it's already wrapped in App.tsx routes
  // Wrapping conditionally causes hook order issues
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B1628] via-[#231C37] to-[#1B1628] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#1B1628] via-[#231C37] to-[#1B1628] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Affiliate Program Admin</h1>
            <p className="text-gray-400">Manage affiliates, track performance, and process payouts</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-red-300 hover:text-red-200 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white'
                  : 'bg-[#2A243E] text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('affiliates')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'affiliates'
                  ? 'bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white'
                  : 'bg-[#2A243E] text-gray-400 hover:text-white'
              }`}
            >
              Affiliates
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'payouts'
                  ? 'bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white'
                  : 'bg-[#2A243E] text-gray-400 hover:text-white'
              }`}
            >
              Payouts
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'revenue'
                  ? 'bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white'
                  : 'bg-[#2A243E] text-gray-400 hover:text-white'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setActiveTab('partner-applications')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'partner-applications'
                  ? 'bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white'
                  : 'bg-[#2A243E] text-gray-400 hover:text-white'
              }`}
            >
              Partner Applications
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div>
              {/* Key Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
                  <div className="text-sm text-gray-400 mb-1">Total Affiliates</div>
                  <div className="text-3xl font-bold text-white">{stats.totalAffiliates}</div>
                  <div className="text-xs text-gray-500">{stats.activeAffiliates} active</div>
                </div>

                <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
                  <div className="text-sm text-gray-400 mb-1">Referrals</div>
                  <div className="text-3xl font-bold text-white">{stats.totalReferrals}</div>
                  <div className="text-xs text-gray-500">{stats.convertedReferrals} converted</div>
                </div>

                <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
                  <div className="text-sm text-gray-400 mb-1">Conversion Rate</div>
                  <div className="text-3xl font-bold text-white">{stats.conversionRate}%</div>
                </div>

                <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
                  <div className="text-sm text-gray-400 mb-1">Avg Commission</div>
                  <div className="text-3xl font-bold text-white">{formatCurrency(stats.averageCommissionPerAffiliate)}</div>
                  <div className="text-xs text-gray-500">per affiliate</div>
                </div>
              </div>

              {/* Revenue Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
                  <div className="text-sm text-gray-400 mb-1">Total Revenue</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</div>
                </div>

                <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
                  <div className="text-sm text-gray-400 mb-1">Commissions</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalCommissions)}</div>
                </div>

                <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
                  <div className="text-sm text-gray-400 mb-1">Paid Out</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalPaidOut)}</div>
                </div>

                <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
                  <div className="text-sm text-gray-400 mb-1">Net Profit</div>
                  <div className="text-2xl font-bold text-green-400">{formatCurrency(stats.netProfit)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Affiliates Tab */}
          {activeTab === 'affiliates' && (
            <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
              <h2 className="text-xl font-bold text-white mb-4">All Affiliates</h2>
              
              {affiliates.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No affiliates yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#3A344E]">
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Affiliate</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Code</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-semibold">Referrals</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-semibold">Earnings</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-semibold">Balance</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliates.map((affiliate) => (
                        <tr key={affiliate.id} className="border-b border-[#3A344E]/50">
                          <td className="py-3 px-4">
                            <div className="text-white">{affiliate.profiles?.business_name || 'Unknown'}</div>
                            <div className="text-xs text-gray-400">{affiliate.profiles?.contact_email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-gray-300">{affiliate.referral_code}</span>
                          </td>
                          <td className="py-3 px-4 text-center text-white">{affiliate.total_referrals}</td>
                          <td className="py-3 px-4 text-right text-white">{formatCurrency(affiliate.total_earnings)}</td>
                          <td className="py-3 px-4 text-right text-white font-semibold">{formatCurrency(affiliate.pending_balance)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              affiliate.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              affiliate.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {affiliate.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Payouts Tab */}
          {activeTab === 'payouts' && (
            <div>
              {/* Process Payouts Button */}
              <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E] mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Process Pending Payouts</h3>
                    <p className="text-gray-400 text-sm">
                      {payouts.filter(p => p.status === 'pending').length} pending payouts
                    </p>
                  </div>
                  <button
                    onClick={handleProcessPayouts}
                    disabled={processing}
                    className="px-6 py-3 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Process All Payouts'}
                  </button>
                </div>
              </div>

              {/* Payouts Table */}
              <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
                <h2 className="text-xl font-bold text-white mb-4">Payout History</h2>
                
                {payouts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No payouts yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#3A344E]">
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Affiliate</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-semibold">Amount</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Requested</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Processed</th>
                          <th className="text-center py-3 px-4 text-gray-400 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payouts.map((payout) => (
                          <tr key={payout.id} className="border-b border-[#3A344E]/50">
                            <td className="py-3 px-4">
                              <div className="text-white">{payout.affiliate?.profiles?.business_name || 'Unknown'}</div>
                              <div className="text-xs text-gray-400">{payout.affiliate?.referral_code}</div>
                            </td>
                            <td className="py-3 px-4 text-right text-white font-semibold">{formatCurrency(payout.amount)}</td>
                            <td className="py-3 px-4 text-gray-300">{formatDate(payout.requested_at)}</td>
                            <td className="py-3 px-4 text-gray-300">
                              {payout.processed_at ? formatDate(payout.processed_at) : '-'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                payout.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                payout.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                payout.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {payout.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && revenue && (
            <div>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
                  <div className="text-sm text-gray-400 mb-1">Total Revenue</div>
                  <div className="text-3xl font-bold text-white">{formatCurrency(revenue.totalRevenue)}</div>
                </div>

                <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
                  <div className="text-sm text-gray-400 mb-1">Total Commissions</div>
                  <div className="text-3xl font-bold text-white">{formatCurrency(revenue.totalCommissions)}</div>
                  <div className="text-xs text-gray-500">
                    {revenue.totalRevenue > 0 ? Math.round((revenue.totalCommissions / revenue.totalRevenue) * 100) : 0}% of revenue
                  </div>
                </div>

                <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
                  <div className="text-sm text-gray-400 mb-1">Net Profit</div>
                  <div className="text-3xl font-bold text-green-400">{formatCurrency(revenue.netProfit)}</div>
                  <div className="text-xs text-gray-500">
                    {revenue.totalRevenue > 0 ? Math.round((revenue.netProfit / revenue.totalRevenue) * 100) : 0}% of revenue
                  </div>
                </div>
              </div>

              {/* Plan Breakdown */}
              <div className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
                <h2 className="text-xl font-bold text-white mb-4">Revenue by Plan</h2>
                
                {Object.keys(revenue.planBreakdown).length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No revenue data yet</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(revenue.planBreakdown).map(([plan, data]) => (
                      <div key={plan} className="bg-[#1B1628] p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-white font-semibold capitalize">{plan} Plan</div>
                            <div className="text-xs text-gray-400">{data.count} subscriptions</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">{formatCurrency(data.revenue)}</div>
                            <div className="text-xs text-gray-400">Commission: {formatCurrency(data.commission)}</div>
                          </div>
                        </div>
                        <div className="w-full bg-[#2A243E] rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] h-2 rounded-full"
                            style={{ width: `${(data.commission / data.revenue) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Partner Applications Tab */}
          {activeTab === 'partner-applications' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Partner Applications</h2>
              
              {partnerApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No partner applications yet</div>
              ) : (
                <div className="space-y-4">
                  {partnerApplications.map((app) => (
                    <div key={app.id} className="bg-[#2A243E] rounded-xl p-6 border border-[#3A344E]">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{app.full_name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              app.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400 space-y-1">
                            <p><strong>Email:</strong> {app.email}</p>
                            {app.company_name && <p><strong>Company:</strong> {app.company_name}</p>}
                            {app.industry && <p><strong>Industry:</strong> {app.industry}</p>}
                            {app.website && <p><strong>Website:</strong> <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-[#EF8E81] hover:underline">{app.website}</a></p>}
                            {app.expected_referrals_per_month && <p><strong>Expected Referrals/Month:</strong> {app.expected_referrals_per_month}</p>}
                            <p><strong>Applied:</strong> {formatDate(app.created_at)}</p>
                            {app.reviewed_at && <p><strong>Reviewed:</strong> {formatDate(app.reviewed_at)}</p>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-white mb-2">Reason for Applying:</h4>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{app.reason_for_applying}</p>
                      </div>

                      {app.rejection_reason && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <h4 className="text-sm font-semibold text-red-400 mb-1">Rejection Reason:</h4>
                          <p className="text-red-300 text-sm">{app.rejection_reason}</p>
                        </div>
                      )}

                      {app.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApproveApplication(app.id)}
                            disabled={processingApplication === app.id}
                            className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingApplication === app.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleRejectApplication(app.id)}
                            disabled={processingApplication === app.id}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingApplication === app.id ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
