import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { logger } from './utils/logger';
import { useAIConversation, useFavoritePrompts } from './hooks/useAIConversation';
import { getPagePrompts } from './utils/aiPrompts';
import { getFriendlyError } from './utils/errorMessages';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIUsage {
  monthly: {
    conversations: number;
    costCents: number;
  };
  limit: {
    currentCostCents: number;
    limitCostCents: number;
    remainingCents: number;
  };
  warning?: string;
}

// Function to collect user's business context for AI personalization
const getUserBusinessContext = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data: profile } = await supabase
      .from('profiles')
      .select('business_name, business_category, location, marketing_channels, primary_marketing_goal, business_size')
      .eq('id', user.id)
      .single();

    if (!profile) return {};

    // Map business data to AI context format
    const businessContext = {
      userBusinessType: profile.business_category || 'Not specified',
      userIndustry: profile.business_category || 'General',
      userExperienceLevel: mapBusinessSizeToExperience(profile.business_size),
      userLocation: profile.location || 'Not specified',
      userMarketingGoal: profile.primary_marketing_goal || 'General growth',
      userMarketingChannels: profile.marketing_channels || []
    };

    return businessContext;
  } catch (error) {
    logger.warn('Could not load business context for AI', error);
    return {};
  }
};

// Helper function to map business size to experience level
const mapBusinessSizeToExperience = (businessSize?: string | null): string => {
  if (!businessSize) return 'Not specified';

  const size = businessSize.toLowerCase();
  if (size.includes('1-5') || size.includes('solo') || size.includes('startup')) {
    return 'Beginner';
  } else if (size.includes('6-20') || size.includes('small')) {
    return 'Intermediate';
  } else if (size.includes('21+') || size.includes('medium') || size.includes('large')) {
    return 'Advanced';
  }

  return 'Not specified';
};

export default function FloatingAssistant() {
  const location = useLocation();
  const conversationId = location.pathname; // Use pathname as conversation ID for context
  const { messages, addMessage, clearMessages } = useAIConversation(conversationId);
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoritePrompts();
  const pagePrompts = getPagePrompts(location.pathname);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<AIUsage | null>(null);
  const [showExamples, setShowExamples] = useState(messages.length === 0);
  const [showFavorites, setShowFavorites] = useState(false);
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message if no messages exist for this conversation
  useEffect(() => {
    // Only add welcome message if this conversation has no messages
    if (messages.length === 0) {
      addMessage({
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm Hillary. I can help with whatever you're doing on this page. ${pagePrompts.description}. What do you need?`,
        timestamp: new Date()
      });
      setShowExamples(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]); // Re-run when conversation context changes (messages are loaded via hook)

  // Load usage stats
  useEffect(() => {
    const loadUsage = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { API_BASE_URL } = await import('./services/api');
        const res = await fetch(`${API_BASE_URL}/ai/usage`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setUsage(data.data);
            if (data.data.warning) {
              setRateLimitWarning(data.data.warning);
            }
          }
        }
      } catch (error) {
        logger.debug('Failed to load AI usage', error);
      }
    };

    if (isOpen) {
      loadUsage();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Update page prompts when route changes
  useEffect(() => {
    if (isOpen && messages.length > 1) {
      setShowExamples(false);
    }
  }, [location.pathname, isOpen, messages.length]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessageText = inputValue.trim();
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: userMessageText,
      timestamp: new Date()
    };
    
    addMessage(userMsg);
    setInputValue('');
    setShowExamples(false);
    setIsLoading(true);
    setRateLimitWarning(null);

    try {
      const conversationHistory = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      // Collect user business context for personalized AI responses
      const businessContext = await getUserBusinessContext();

      // Get auth token for the API call
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders: Record<string, string> = {};
      if (session?.access_token) {
        authHeaders['Authorization'] = `Bearer ${session.access_token}`;
      }

      const { API_BASE_URL } = await import('./services/api');
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          message: userMessageText,
          conversationHistory,
          pagePath: location.pathname,
          ...businessContext
        })
      });
      
      const data = await res.json();
      
      // Handle rate limiting (429)
      if (res.status === 429) {
        const friendlyError = getFriendlyError(data.error || 'Rate limit exceeded');
        const errorMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: `⚠️ **Rate Limit Reached**\n\n${friendlyError.message}\n\n${friendlyError.recoverySteps?.join('\n') || 'Please try again later.'}`,
          timestamp: new Date()
        };
        addMessage(errorMsg);
        setRateLimitWarning(data.error || 'You\'ve reached your rate limit');
        return;
      }
      
      if (data.success && data.data?.response) {
        const aiMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date()
        };
        addMessage(aiMsg);
        
        // Show warning if present (usage approaching limit)
        if (data.data.warning) {
          setRateLimitWarning(data.data.warning);
        }
        
        // Reload usage stats
        if (session) {
          try {
            const usageRes = await fetch(`${API_BASE_URL}/ai/usage`, {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              }
            });
            if (usageRes.ok) {
              const usageData = await usageRes.json();
              if (usageData.success && usageData.data) {
                setUsage(usageData.data);
              }
            }
          } catch (error) {
            // Ignore usage fetch errors
          }
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      const friendlyError = getFriendlyError(error);
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `❌ **Connection Error**\n\n${friendlyError.message}\n\n**What you can do:**\n${friendlyError.recoverySteps?.map(step => `• ${step}`).join('\n') || '• Check your internet connection\n• Try again in a moment\n• Refresh the page if the problem persists'}`,
        timestamp: new Date()
      };
      addMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (example: string) => {
    setInputValue(example);
    setShowExamples(false);
  };

  const handleFavoriteToggle = (prompt: string) => {
    if (isFavorite(prompt)) {
      removeFavorite(prompt);
    } else {
      addFavorite(prompt);
    }
  };

  return (
    <div className="floating-assistant-root" aria-live="polite">
      {!isOpen && (
        <button
          className="assistant-fab"
          aria-label="Open Marketing Assistant"
          title="Marketing Assistant"
          onClick={() => setIsOpen(true)}
        >
          marketing assistant
        </button>
      )}

      {isOpen && (
        <div className="assistant-panel" role="dialog" aria-modal="false" aria-label="Marketing Assistant">
          <div className="assistant-panel-header">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
              <div className="assistant-title">Hillary • Marketing Assistant</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, color: '#FFF1E7' }}>
                {pagePrompts.description}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {/* Usage Indicator */}
              {usage && (
                <div style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.25rem 0.5rem',
                  background: usage.limit.currentCostCents >= usage.limit.limitCostCents * 0.9 
                    ? 'rgba(239, 68, 68, 0.2)' 
                    : usage.limit.currentCostCents >= usage.limit.limitCostCents * 0.75
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid',
                  borderColor: usage.limit.currentCostCents >= usage.limit.limitCostCents * 0.9
                    ? 'rgba(239, 68, 68, 0.4)'
                    : usage.limit.currentCostCents >= usage.limit.limitCostCents * 0.75
                    ? 'rgba(245, 158, 11, 0.4)'
                    : 'rgba(59, 130, 246, 0.4)',
                  borderRadius: '6px',
                  color: '#FFF1E7'
                }} title={`AI Usage: $${(usage.limit.currentCostCents / 100).toFixed(2)} / $${(usage.limit.limitCostCents / 100).toFixed(2)}`}>
                  ${(usage.limit.currentCostCents / 100).toFixed(2)} / ${(usage.limit.limitCostCents / 100).toFixed(2)}
                </div>
              )}
              <button 
                className="assistant-close" 
                aria-label="Close" 
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#FFF1E7', cursor: 'pointer', fontSize: '1.5rem', padding: '0.25rem 0.5rem' }}
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Rate Limit Warning */}
          {rateLimitWarning && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '0.75rem',
              margin: '0.75rem',
              color: '#FFF1E7',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <strong>Usage Warning</strong>
              </div>
              {rateLimitWarning}
            </div>
          )}

          <div className="assistant-panel-body">
            <div className="assistant-messages">
              {messages.map(m => (
                <div key={m.id} className={`assistant-message ${m.role}`}>
                  <div className="assistant-bubble" style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              {isLoading && (
                <div className="assistant-message assistant"><div className="assistant-bubble"><span className="assistant-typing"><span></span><span></span><span></span></span></div></div>
              )}
            </div>
          </div>
          
          {/* Examples Section (shown when no messages or explicitly requested) */}
          {(showExamples || messages.length <= 1) && pagePrompts.examples.length > 0 && (
            <div style={{ 
              padding: '0.75rem', 
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF1E7', opacity: 0.8 }}>💡 Example Prompts</span>
                <button 
                  onClick={() => setShowExamples(false)}
                  style={{ background: 'transparent', border: 'none', color: '#FFF1E7', opacity: 0.6, cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  Hide
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {pagePrompts.examples.slice(0, 3).map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(example)}
                    style={{
                      textAlign: 'left',
                      padding: '0.6rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#FFF1E7',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 142, 129, 0.2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Quick Prompts & Favorites */}
          <div style={{ 
            padding: '0.75rem', 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.02)'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                style={{
                  padding: '0.4rem 0.6rem',
                  background: showFavorites ? 'rgba(239, 142, 129, 0.3)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#FFF1E7',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                ⭐ Favorites ({favorites.length})
              </button>
              {favorites.length > 0 && !showFavorites && (
                <button
                  onClick={() => setShowExamples(true)}
                  style={{
                    padding: '0.4rem 0.6rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF1E7',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  Show Examples
                </button>
              )}
            </div>
            
            {showFavorites && favorites.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
                {favorites.map((fav, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={() => handleExampleClick(fav)}
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        padding: '0.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: '#FFF1E7',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 142, 129, 0.2)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    >
                      {fav}
                    </button>
                    <button
                      onClick={() => handleFavoriteToggle(fav)}
                      style={{
                        padding: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#EF8E81',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                      title="Remove from favorites"
                    >
                      ⭐
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="assistant-quick-prompts" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {pagePrompts.quickPrompts.map((p, idx) => (
                <button 
                  key={idx} 
                  onClick={() => {
                    setInputValue(p);
                    setShowExamples(false);
                    setShowFavorites(false);
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(239, 142, 129, 0.2)',
                    border: '1px solid rgba(239, 142, 129, 0.3)',
                    borderRadius: '6px',
                    color: '#FFF1E7',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 142, 129, 0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 142, 129, 0.2)'; }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          <div className="assistant-panel-footer">
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for help with what's on this page…"
                disabled={isLoading}
                aria-label="Type your message"
                style={{ flex: 1, resize: 'none' }}
              />
              {inputValue.trim() && (
                <button
                  onClick={() => handleFavoriteToggle(inputValue.trim())}
                  style={{
                    padding: '0.5rem',
                    background: isFavorite(inputValue.trim()) ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: isFavorite(inputValue.trim()) ? '#F59E0B' : '#FFF1E7',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={isFavorite(inputValue.trim()) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  ⭐
                </button>
              )}
              <button className="assistant-send" disabled={!inputValue.trim() || isLoading} onClick={handleSend}>
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
            {messages.length > 1 && (
              <button
                onClick={clearMessages}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.4rem 0.6rem',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#FFF1E7',
                  opacity: 0.6,
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  width: '100%'
                }}
              >
                Clear Conversation
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


