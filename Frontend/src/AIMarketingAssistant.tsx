import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { MarketingGoal, Task } from './types';
import { supabase } from './lib/supabase';
import { logger } from './utils/logger';

interface AIMarketingAssistantProps {
  marketingGoals?: MarketingGoal[];
  tasks?: Task[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
    logger.debug('Could not load business context for AI', error);
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

const INITIAL_WELCOME = {
  id: 'welcome',
  role: 'assistant' as const,
  content: "Hi there! I'm Hillary, your marketing consultant. I'm here to help you with your marketing strategy, especially as you work through your marketing track. What would you like to work on today?",
  timestamp: new Date()
};

export default function AIMarketingAssistant({ marketingGoals = [], tasks = [] }: AIMarketingAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        logger.error('Error loading chat sessions', error);
        return;
      }
      setSessions(data || []);
    } catch (err) {
      logger.error('Error in loadSessions', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleSelectSession = (session: any) => {
    setCurrentSessionId(session.id);
    const parsedMessages = (session.messages || []).map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
    }));
    setMessages(parsedMessages.length > 0 ? parsedMessages : [INITIAL_WELCOME]);
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([INITIAL_WELCOME]);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat session?')) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        logger.error('Error deleting session', error);
        return;
      }

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
    } catch (err) {
      logger.error('Error in handleDeleteSession', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    // Filter out welcome message from the saved/sent list to save context window tokens
    const filterMessages = messages.filter(m => m.id !== 'welcome');
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare conversation history for context (last 10 messages)
      const conversationHistory = filterMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Collect user business context for personalized AI responses
      const businessContext = await getUserBusinessContext();

      // Get auth token for the API call
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders: Record<string, string> = {};
      if (session?.access_token) {
        authHeaders['Authorization'] = `Bearer ${session.access_token}`;
      }

      const { API_BASE_URL } = await import('./services/api');
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
          ...businessContext
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date()
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);

        // Save to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (!currentSessionId) {
            // First message in chat: create session
            const title = userMessage.content.substring(0, 35) + (userMessage.content.length > 35 ? '...' : '');
            const { data: newSession, error: createError } = await supabase
              .from('chat_sessions')
              .insert([{
                user_id: user.id,
                title,
                messages: finalMessages
              }])
              .select()
              .single();

            if (createError) {
              logger.error('Error creating chat session in DB', createError);
            } else if (newSession) {
              setCurrentSessionId(newSession.id);
              setSessions(prev => [newSession, ...prev]);
            }
          } else {
            // Existing session: append messages
            const { error: updateError } = await supabase
              .from('chat_sessions')
              .update({
                messages: finalMessages,
                updated_at: new Date().toISOString()
              })
              .eq('id', currentSessionId);

            if (updateError) {
              logger.error('Error updating chat session in DB', updateError);
            } else {
              // Update sessions list locally
              setSessions(prev => 
                prev.map(s => s.id === currentSessionId ? { ...s, messages: finalMessages, updated_at: new Date().toISOString() } : s)
              );
            }
          }
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      logger.error('AI Chat Error', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeGoal = marketingGoals.find(goal => goal.isActive);
  const pendingTasks = tasks.filter(task => task.status === 'todo');

  return (
    <div className="ai-marketing-assistant-layout">
      {/* Sidebar with Chat History */}
      <div className="chat-sidebar">
        <button className="new-chat-btn" onClick={handleNewChat}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>

        <div className="sidebar-sessions-list">
          {sessionsLoading ? (
            <div className="text-center py-4 text-[#FFF1E7]/50 text-xs">Loading history...</div>
          ) : sessions.length > 0 ? (
            sessions.map(s => (
              <button
                key={s.id}
                className={`session-item ${currentSessionId === s.id ? 'active' : ''}`}
                onClick={() => handleSelectSession(s)}
              >
                <span className="session-title" title={s.title}>{s.title}</span>
                <span 
                  className="session-delete-btn" 
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  title="Delete chat history"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </span>
              </button>
            ))
          ) : (
            <div className="text-center py-4 text-[#FFF1E7]/40 text-xs">No past sessions</div>
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="chat-main-area">
        <div className="ai-marketing-assistant" style={{ padding: 0, height: '100%', maxWidth: 'none', margin: 0 }}>
          <div className="ai-header" style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '2rem' }}>AI Marketing Assistant</h1>
            <p>Get personalized marketing advice from Hillary, your marketing consultant</p>
            {activeGoal && (
              <div className="current-track-info" style={{ marginTop: '0.5rem' }}>
                <h3>Current Track: {activeGoal.title}</h3>
                <p>Week {activeGoal.currentWeek} of {activeGoal.duration} • {activeGoal.progress}% complete</p>
                <p>{pendingTasks.length} pending tasks</p>
              </div>
            )}
          </div>

          <div className="chat-container">
            <div className="messages">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.role}`}>
                  <div className="message-content">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <div className="message-timestamp">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your marketing strategy, current track progress, or any marketing questions..."
                disabled={isLoading}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="send-button"
              >
                Send
              </button>
            </div>
          </div>

          <div className="quick-actions" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Quick Actions</h3>
            <div className="action-buttons">
              <button onClick={() => setInputValue("Help me understand this week's marketing concept better")}>
                Clarify This Week's Concept
              </button>
              <button onClick={() => setInputValue("I'm not sure how to implement this week's action item")}>
                Help with Action Item
              </button>
              <button onClick={() => setInputValue("Can you suggest the best way to approach this for my specific business?")}>
                Business-Specific Advice
              </button>
              <button onClick={() => setInputValue("I feel overwhelmed with marketing. What should I focus on?")}>
                Simplify My Approach
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
