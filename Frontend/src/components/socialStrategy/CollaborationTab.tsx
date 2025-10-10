import * as React from 'react';
import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import type { Collaborator, SocialStrategyShareLink, SocialMediaStrategy } from '../../types';
import { logger } from '../../utils/logger';
import { exportStrategyToPDF } from '../../utils/socialStrategyPDF';
import { supabase } from '../../lib/supabase';

interface CollaborationTabProps {
  collaborators: Collaborator[];
  onCollaboratorsChange: (collaborators: Collaborator[]) => void;
  strategy: SocialMediaStrategy;
}

export default function CollaborationTab({ collaborators, onCollaboratorsChange, strategy }: CollaborationTabProps) {
  const [shareLinks, setShareLinks] = useState<SocialStrategyShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingLink, setCreatingLink] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  
  // Ensure collaborators is always an array
  const safeCollaborators = collaborators || [];
  const [newLink, setNewLink] = useState({
    recipientName: '',
    recipientEmail: '',
    expiresAt: ''
  });
  const [showCollabForm, setShowCollabForm] = useState(false);
  const [newCollab, setNewCollab] = useState<Partial<Collaborator>>({
    name: '',
    role: '',
    email: '',
    accessLevel: 'view'
  });
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    loadShareLinks();
  }, []);

  const loadShareLinks = async () => {
    try {
      setLoading(true);
      const result = await apiService.getShareLinks();
      if (result.success && result.data) {
        setShareLinks(result.data);
      }
    } catch (error) {
      logger.error('Error loading share links', error);
    } finally {
      setLoading(false);
    }
  };

  const createShareLink = async () => {
    try {
      setCreatingLink(true);
      const result = await apiService.createShareLink({
        recipientName: newLink.recipientName || undefined,
        recipientEmail: newLink.recipientEmail || undefined,
        expiresAt: newLink.expiresAt || undefined
      });

      if (result.success && result.data) {
        await loadShareLinks();
        setShowLinkForm(false);
        setNewLink({ recipientName: '', recipientEmail: '', expiresAt: '' });
      }
    } catch (error) {
      logger.error('Error creating share link', error);
    } finally {
      setCreatingLink(false);
    }
  };

  const toggleShareLink = async (linkId: string, isActive: boolean) => {
    try {
      await apiService.toggleShareLink(linkId, !isActive);
      await loadShareLinks();
    } catch (error) {
      logger.error('Error toggling share link', error);
    }
  };

  const deleteShareLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to revoke this share link?')) return;
    
    try {
      await apiService.deleteShareLink(linkId);
      await loadShareLinks();
    } catch (error) {
      logger.error('Error deleting share link', error);
    }
  };

  const copyToClipboard = (accessCode: string) => {
    const url = `${window.location.origin}/shared/strategy/${accessCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(accessCode);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const addCollaborator = () => {
    if (!newCollab.name || !newCollab.email) return;
    
    onCollaboratorsChange([
      ...safeCollaborators,
      {
        name: newCollab.name,
        role: newCollab.role || 'Collaborator',
        email: newCollab.email,
        accessLevel: 'view'
      }
    ]);
    
    setNewCollab({ name: '', role: '', email: '', accessLevel: 'view' });
    setShowCollabForm(false);
  };

  const removeCollaborator = (email: string) => {
    onCollaboratorsChange(safeCollaborators.filter(c => c.email !== email));
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      
      // Get business name from profile
      const { data: { user } } = await supabase.auth.getUser();
      let businessName = 'My Business';
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name, full_name')
          .eq('id', user.id)
          .single();
        
        businessName = profile?.business_name || profile?.full_name || 'My Business';
      }
      
      await exportStrategyToPDF(strategy, businessName);
    } catch (error) {
      logger.error('Error exporting PDF', error);
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Team Collaborators Section */}
      <div>
        <h3 className="text-xl font-semibold text-[#FFF1E7] mb-2">Team Collaborators</h3>
        <p className="text-[#FFF1E7]/60 text-sm mb-6">
          Keep track of team members working on your social media strategy (for reference only).
        </p>

        <div className="space-y-3 mb-4">
          {safeCollaborators.map((collab, index) => (
            <div
              key={index}
              className="bg-[#1A1625]/50 rounded-lg p-4 border border-[#2A2438] flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-[#EF8E81] flex items-center justify-center text-white font-bold">
                  {collab.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-[#FFF1E7] font-medium">{collab.name}</div>
                  <div className="text-[#FFF1E7]/60 text-sm">{collab.role} • {collab.email}</div>
                </div>
              </div>
              <button
                onClick={() => removeCollaborator(collab.email)}
                className="text-[#FFF1E7]/40 hover:text-red-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {showCollabForm ? (
          <div className="bg-[#1A1625]/50 rounded-lg p-6 border border-[#2A2438] mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[#FFF1E7]/80 text-sm block mb-2">Name *</label>
                <input
                  type="text"
                  value={newCollab.name}
                  onChange={(e) => setNewCollab({ ...newCollab, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-2 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81]"
                />
              </div>
              <div>
                <label className="text-[#FFF1E7]/80 text-sm block mb-2">Role</label>
                <input
                  type="text"
                  value={newCollab.role}
                  onChange={(e) => setNewCollab({ ...newCollab, role: e.target.value })}
                  placeholder="Designer, Manager, etc."
                  className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-2 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81]"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-[#FFF1E7]/80 text-sm block mb-2">Email *</label>
              <input
                type="email"
                value={newCollab.email}
                onChange={(e) => setNewCollab({ ...newCollab, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-2 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81]"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCollabForm(false)}
                className="px-4 py-2 text-[#FFF1E7]/60 hover:text-[#FFF1E7] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addCollaborator}
                className="bg-[#EF8E81] hover:bg-[#E67A6E] text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Add Collaborator
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCollabForm(true)}
            className="w-full bg-[#2A2438] hover:bg-[#3A3448] text-[#FFF1E7] py-3 rounded-lg border-2 border-dashed border-[#3A3448] hover:border-[#EF8E81] transition-all flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Team Member
          </button>
        )}
      </div>

      {/* Export Section */}
      <div className="pt-8 border-t border-[#2A2438] mb-8">
        <h3 className="text-xl font-semibold text-[#FFF1E7] mb-2">Export Strategy</h3>
        <p className="text-[#FFF1E7]/60 text-sm mb-4">
          Download your complete social media strategy as a professional PDF document.
        </p>
        <button
          onClick={handleExportPDF}
          disabled={exportingPDF}
          className="bg-[#10b981] hover:bg-[#0ea370] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exportingPDF ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>

      {/* Share Links Section */}
      <div className="pt-8 border-t border-[#2A2438]">
        <h3 className="text-xl font-semibold text-[#FFF1E7] mb-2">Share Links</h3>
        <p className="text-[#FFF1E7]/60 text-sm mb-6">
          Generate secure view-only links to share your strategy with designers, freelancers, or team members outside your account.
        </p>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF8E81] mx-auto mb-4"></div>
            <p className="text-[#FFF1E7]/60">Loading share links...</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {shareLinks.map(link => (
                <div
                  key={link.id}
                  className={`bg-[#1A1625]/50 rounded-lg p-4 border ${
                    link.isActive ? 'border-[#2A2438]' : 'border-red-900/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {link.recipientName && (
                        <div className="text-[#FFF1E7] font-medium mb-1">{link.recipientName}</div>
                      )}
                      {link.recipientEmail && (
                        <div className="text-[#FFF1E7]/60 text-sm mb-2">{link.recipientEmail}</div>
                      )}
                      <div className="flex items-center space-x-2">
                        <code className="bg-[#2A2438] text-[#EF8E81] px-3 py-1 rounded text-sm font-mono">
                          {link.accessCode}
                        </code>
                        <button
                          onClick={() => copyToClipboard(link.accessCode)}
                          className="text-[#EF8E81] hover:text-[#E67A6E] transition-colors"
                          title="Copy link"
                        >
                          {copiedLink === link.accessCode ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="text-[#FFF1E7]/40 text-xs mt-2">
                        Created: {new Date(link.createdAt).toLocaleDateString()}
                        {link.expiresAt && ` • Expires: ${new Date(link.expiresAt).toLocaleDateString()}`}
                        {link.lastAccessedAt && ` • Last accessed: ${new Date(link.lastAccessedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleShareLink(link.id, link.isActive)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          link.isActive
                            ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {link.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => deleteShareLink(link.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Revoke link"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showLinkForm ? (
              <div className="bg-[#1A1625]/50 rounded-lg p-6 border border-[#2A2438] mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[#FFF1E7]/80 text-sm block mb-2">Recipient Name (Optional)</label>
                    <input
                      type="text"
                      value={newLink.recipientName}
                      onChange={(e) => setNewLink({ ...newLink, recipientName: e.target.value })}
                      placeholder="Who is this link for?"
                      className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-2 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81]"
                    />
                  </div>
                  <div>
                    <label className="text-[#FFF1E7]/80 text-sm block mb-2">Recipient Email (Optional)</label>
                    <input
                      type="email"
                      value={newLink.recipientEmail}
                      onChange={(e) => setNewLink({ ...newLink, recipientEmail: e.target.value })}
                      placeholder="their@email.com"
                      className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-2 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81]"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-[#FFF1E7]/80 text-sm block mb-2">Expiration Date (Optional)</label>
                  <input
                    type="date"
                    value={newLink.expiresAt}
                    onChange={(e) => setNewLink({ ...newLink, expiresAt: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#2A2438] text-[#FFF1E7] px-4 py-2 rounded-lg border border-[#3A3448] focus:outline-none focus:border-[#EF8E81]"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowLinkForm(false)}
                    className="px-4 py-2 text-[#FFF1E7]/60 hover:text-[#FFF1E7] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createShareLink}
                    disabled={creatingLink}
                    className="bg-[#EF8E81] hover:bg-[#E67A6E] disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {creatingLink ? 'Creating...' : 'Generate Link'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLinkForm(true)}
                className="w-full bg-[#2A2438] hover:bg-[#3A3448] text-[#FFF1E7] py-3 rounded-lg border-2 border-dashed border-[#3A3448] hover:border-[#EF8E81] transition-all flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Generate Share Link
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

